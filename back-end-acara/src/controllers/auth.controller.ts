import { Request, Response } from "express";
import * as yup from 'yup';
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { genetareToken } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

type TRegister = {
    fullName: string;
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

type Tlogin = {
    identifier: string,
    password: string
};

const registerValidateSchema = yup.object({
    fullName: yup.string().required(),
    userName: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().required().min(6, "Password must be at least 6 characters").test('at-least-one-uppercase-latter', 'Contains at least one uppercase latter', (value) => {
        if (!value) return false;
        const regex = /^(?=.*[A-Z])/;
        return regex.test(value);
    }).test('at-least-one-number-latter', 'Contains at least one number latter', (value) => {
        if (!value) return false;
        const regex = /^(?=.*\d)/;
        return regex.test(value);
    }),
    confirmPassword: yup.string().required().oneOf([yup.ref('password'), ""], "Password not match"),
});

export default {
    async register(req: Request, res: Response) {
        /**
         #swagger.tags = ['Auth']
         */
        const {
            fullName,
            userName,
            email,
            password,
            confirmPassword
        } = req.body as unknown as TRegister;

        try {
            await registerValidateSchema.validate({
                fullName,
                userName,
                email,
                password,
                confirmPassword
            });

            const result = await UserModel.create({
                fullName,
                userName,
                email,
                password
            })

            response.success(res, result, "Success registration!");
        } catch (error) {

            response.error(res, error, 'Failed registration')
        }
    },

    async login(req: Request, res: Response) {
        /**
         #swagger.tags = ['Auth']
         #swagger.requestBody={
         require: true,
         schema: {$ref: "#/components/schemas/LoginRequest"}
         }
         */

        const {
            identifier,
            password
        } = req.body as unknown as Tlogin
        try {
            //ambil data user berdasarkan identifier dapat menggunakan email atau username
            const userIdentifier = await UserModel.findOne({
                $or: [
                    {
                        email: identifier
                    },
                    {
                        userName: identifier
                    }
                ],
                isActive: true,
            });
            if (!userIdentifier) {
                return response.unauthorized(res, 'user not found');
            }

            //validasi password
            const validatePassword: boolean = encrypt(password) === userIdentifier.password;

            if (!validatePassword) {
                return response.unauthorized(res, 'user not found');
            }

            const token = genetareToken({
                id: userIdentifier._id,
                role: userIdentifier.role,
            });

            response.success(res, token, 'login success');
        } catch (error) {
            response.error(res, error, 'login failed');
        }
    },
    async me(req: IReqUser, res: Response) {
        /**
         #swagger.tags = ['Auth']
         #swagger.security = [{
         "bearerAuth": []
         }]
         */
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id)

            response.success(res, result, 'success get user profile');
        } catch (error) {
            response.error(res, error, 'failed get user profile')
        }
    },
    async activation(req: Request, res: Response) {
        /**
         #swagger.tags = ['Auth']
         #swagger.requestBody ={
         require: true,
         schema: {$ref: '#/components/schemas/ActivationRequest'}
         }
         */
        try {
            const { code } = req.body as { code: string };

            const user = await UserModel.findOneAndUpdate({
                activationCode: code,
            },
                {
                    isActive: true,
                },
                {
                    new: true,
                }
            );
            response.success(res, user, 'user successfully activated');
        } catch (error) {
            response.error(res, error, 'user is failed activated')
        }
    }
};