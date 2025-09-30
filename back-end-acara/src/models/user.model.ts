import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";
import { sendMail, renderMailHtml } from "../utils/mail/mail";
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../utils/env";
import { ROLES } from "../utils/constant";
import * as yup from "yup";

const validatePassword = yup.string().required().min(6, "Password must be at least 6 characters").test('at-least-one-uppercase-latter', 'Contains at least one uppercase latter', (value) => {
    if (!value) return false;
    const regex = /^(?=.*[A-Z])/;
    return regex.test(value);
}).test('at-least-one-number-latter', 'Contains at least one number latter', (value) => {
    if (!value) return false;
    const regex = /^(?=.*\d)/;
    return regex.test(value);
});
const validateConfirmPassword = yup.string().required().oneOf([yup.ref('password'), ""], "Password not match");

export const USER_MODEL_NAME = 'User';

export const userLoginDTO = yup.object({
    identifier: yup.string().required(),
    password: validatePassword,
});

export const userUpdatePasswordDTO = yup.object({
    oldPassword: validatePassword,
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
});

export const userDTO = yup.object({
    fullName: yup.string().required(),
    userName: yup.string().required(),
    email: yup.string().email().required(),
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
});

export type TypeUser = yup.InferType<typeof userDTO>;

export interface User extends Omit<TypeUser, "confirmPassword"> {
    isActive: boolean;
    activationCode: string;
    role: string;
    profilePicture: string;
    createdAt: string;
}

const Schema = mongoose.Schema;

const UserSchema = new Schema<User>({
    fullName: {
        type: Schema.Types.String,
        required: true
    },
    userName: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    email: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    password: {
        type: Schema.Types.String,
        required: true
    },
    role: {
        type: Schema.Types.String,
        enum: [ROLES.ADMIN, ROLES.MEMBER],
        default: ROLES.MEMBER
    },
    profilePicture: {
        type: Schema.Types.String,
        default: "user.jpg"
    },
    isActive: {
        type: Schema.Types.Boolean,
        default: false
    },
    activationCode: {
        type: Schema.Types.String
    }
}, {
    timestamps: true,
});

//sebelum save data ke database password akan di encryption
UserSchema.pre("save", function (next) {
    const user = this;
    user.password = encrypt(user.password);
    user.activationCode = encrypt(user.id);

    next();
});

UserSchema.post("save", async function (doc, next) {
    try {
        const user = doc;

        console.log("Send Email To: ", user.email);

        const contentMail = await renderMailHtml("registration-success.ejs", {
            username: user.userName,
            fullName: user.fullName,
            email: user.email,
            createdAt: user.createdAt,
            activationLink: `${CLIENT_HOST}/auth/activation?code=${user.activationCode}`
        });

        await sendMail({
            from: EMAIL_SMTP_USER,
            to: user.email,
            subject: "Aktivasi Akun Anda",
            html: contentMail
        });
    } catch (error) {
        console.log(error);
    }
    finally {
        next();
    }
});

//password tidak akan diperlihatkan
UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
}

const UserModel = mongoose.model(USER_MODEL_NAME, UserSchema);

export default UserModel;