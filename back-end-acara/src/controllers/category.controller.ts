import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import CategoryModel, { categoryDAO } from "../models/category.model";
import response from "../utils/response";
import { isValidObjectId } from "mongoose";

export default {
    async create(req: IReqUser, res: Response) {
        try {
            await categoryDAO.validate(req.body);
            const result = await CategoryModel.create(req.body);
            return response.success(res, result, "Category created successfully");
        } catch (error) {
            response.error(res, error, 'failed create category');
        }
    },
    async findAll(req: IReqUser, res: Response) {
        const {
            page = 1,
            limit = 10,
            search
        } = req.query as unknown as IPaginationQuery;
        try {
            const query = {};

            if (search) {
                Object.assign(query, {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                    ]
                })
            }
            const result = await CategoryModel.find(query)
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .exec();

            const count = await CategoryModel.countDocuments(query);

            response.pagination(res, result, {
                total: count,
                totalPages: Math.ceil(count / limit),
                current: page,
            }, "Success find all category")
        } catch (error) {
            response.error(res, error, 'failed findAll category');
        }
    },
    async findOne(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if (isValidObjectId(id)) {
                response.notFound(res, 'Failed find one a category')
            }

            const result = await CategoryModel.findById(id);

            if (!result) {
                response.notFound(res, 'Failed find one a category')
            }

            response.success(res, result, 'succes find one category');
        } catch (error) {
            response.error(res, error, 'failed findOne category');
        }
    },
    async update(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if (isValidObjectId(id)) {
                response.notFound(res, 'Failed update a category')
            }

            const result = await CategoryModel.findByIdAndUpdate(id, req.body, {
                new: true
            });

            response.success(res, result, 'succes update category');
        } catch (error) {
            response.error(res, error, 'failed update category');
        }
    },
    async remove(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if (isValidObjectId(id)) {
                response.notFound(res, 'Failed remove a category')
            }

            const result = await CategoryModel.findByIdAndDelete(id, { new: true });

            response.success(res, result, 'succes remove category');
        } catch (error) {
            response.error(res, error, 'failed remove category');
        }
    },
}