import { Request, Response } from "express";
import * as yup from 'yup';
import UserModel from "../models/user.model";

type TRegister = {
    fullName: string;
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const registerValidateSchema = yup.object({
    fullName: yup.string().required(),
    userName: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().required(),
    confirmPassword: yup.string().required().oneOf([yup.ref('password'), ""], "Password not match"),
});

export default {
    async register(req: Request, res: Response) {
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

            res.status(200).json({
                message: 'Registration successful',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null,
            });
        }
    }
};