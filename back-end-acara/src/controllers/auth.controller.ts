import { Request, Response } from "express";
import * as yup from 'yup';

type TRegister = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const registerValidateSchema = yup.object({
    fullName: yup.string().required(),
    username: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().required(),
    confirmPassword: yup.string().required().oneOf([yup.ref('password'),""], "Password not match"),
});

export default {
    async register(req: Request, res: Response) {
        const {
            fullName,
            username,
            email,
            password,
            confirmPassword
        } = req.body as unknown as TRegister;

        try {
            await registerValidateSchema.validate({
                fullName,
                username,
                email,
                password,
                confirmPassword
            });
            res.status(200).json({
                message: 'Registration successful',
                data:   {
                    fullName,
                    username,
                    email,
                }
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