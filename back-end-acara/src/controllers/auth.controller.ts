import { Request, Response } from "express";
import * as yup from 'yup';
import UserModel, { userDTO, userLoginDTO, userUpdatePasswordDTO } from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { genetareToken } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";


export default {
    async updateProfile(req: IReqUser, res: Response) {
        try {
            const userId = req?.user?.id;
            const { fullName, profilePicture } = req.body;

            const result = await UserModel.findByIdAndUpdate(userId, { fullName, profilePicture }, { new: true });

            if (!result) {
                return response.notFound(res, "user not found");
            }

            response.success(res, result, 'Success to update profile')
        } catch (error) {
            response.error(res, error, "Failed to update profile");
        }
    },
    async updatePassword(req: IReqUser, res: Response) {
        try {
            const userId = req?.user?.id;
            const { oldPassword, password, confirmPassword } = req.body;

            await userUpdatePasswordDTO.validate({
                oldPassword,
                password,
                confirmPassword
            });

            const user = await UserModel.findById(userId);

            if (!user || user.password !== encrypt(oldPassword)) {
                return response.notFound(res, "user not found");
            }

            const result = await UserModel.findByIdAndUpdate(userId, { password: encrypt(password) }, { new: true });

            response.success(res, result, 'success to update password')

        } catch (error) {
            response.error(res, error, "Failed to update password");
        }
    },

    async register(req: Request, res: Response) {
        const {
            fullName,
            userName,
            email,
            password,
            confirmPassword
        } = req.body;

        try {
            await userDTO.validate({
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
        try {
            const {
                identifier,
                password
            } = req.body

            await userLoginDTO.validate({
                identifier,
                password
            })

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
                createdAt: userIdentifier.createdAt, // pakai timestamp user dari database
            });

            response.success(res, token, 'login success');
        } catch (error) {
            response.error(res, error, 'login failed');
        }
    },
    async me(req: IReqUser, res: Response) {
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id)

            response.success(res, result, 'success get user profile');
        } catch (error) {
            response.error(res, error, 'failed get user profile')
        }
    },
    async activation(req: Request, res: Response) {
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