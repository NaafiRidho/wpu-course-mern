import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import EventModel, { eventDAO, TypeEvent } from "../models/event.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
    async create(req: IReqUser, res: Response) {
        try {
            const payload = { ...req.body, createdBy: req.user?.id } as TypeEvent;
            await eventDAO.validate(payload);
            const result = await EventModel.create(payload);
            response.success(res, result, 'success to create event')
        } catch (error) {
            response.error(res, error, 'Failed To create event')
        }
    },
    async findAll(req: IReqUser, res: Response) {
        try {
            const buildQuery = (filter: any) => {
                let query: FilterQuery<TypeEvent> = {};

                if (filter.search) query.$text = { $search: filter.search };
                if (filter.category) query.category = filter.category;
                if (filter.isOnline) query.isOnline = filter.isOnline;
                if (filter.isPublish) query.isPublish = filter.isPublish;
                if (filter.isFeatured) query.isFeatured = filter.isFeatured;

                return query;
            };

            const {
                limit = 10,
                page = 1,
                search,
                category,
                isOnline,
                isFeatured,
                isPublish,
            } = req.query;

            const query = buildQuery({
                search,
                category,
                isOnline,
                isFeatured,
                isPublish,
            });

            const result = await EventModel.find(query)
                .limit(+limit)
                .skip((+page - 1) * +limit)
                .sort({ createdAt: -1 })
                .lean()
                .exec();

            const count = await EventModel.countDocuments(query);

            response.pagination(res, result, {
                total: count,
                totalPages: Math.ceil(count / +limit),
                current: +page,
            }, "Success find all event")
        } catch (error) {
            response.error(res, error, 'Failed Find All event')
        }
    },
    async findOne(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                response.notFound(res, 'Failed find one a event')
            }

            const result = await EventModel.findById(id);

            if (!result) {
                response.notFound(res, 'Failed find one a event')
            }

            response.success(res, result, 'succes find one event');
        } catch (error) {
            response.error(res, error, 'Failed Find One event')
        }
    },
    async update(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                response.notFound(res, 'Failed update a event')
            }

            const result = await EventModel.findByIdAndUpdate(id, req.body, {
                new: true
            });

            response.success(res, result, 'succes update event');
        } catch (error) {
            response.error(res, error, 'Failed update event')
        }
    },
    async remove(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                response.notFound(res, 'Failed remove a event')
            }

            const result = await EventModel.findByIdAndDelete(id, { new: true });

            response.success(res, result, 'succes remove category');
        } catch (error) {
            response.error(res, error, 'Failed Remove event')
        }
    },
    async findOneBySlug(req: IReqUser, res: Response) {
        try {
            const { slug } = req.params;
            const result = await EventModel.findOne({ slug });

            response.success(res, result, 'succes find one by slug event');
        } catch (error) {
            response.error(res, error, 'Failed find one by slug event')
        }
    },
}