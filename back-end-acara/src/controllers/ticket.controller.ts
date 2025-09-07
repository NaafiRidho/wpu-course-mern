import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import TicketModel, { ticket_DAO, TypeTicket } from "../models/ticket.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
    async create(req: IReqUser, res: Response) {
        try {
            await ticket_DAO.validate(req.body);
            const result = await TicketModel.create(req.body);
            response.success(res, result, 'Success create a ticket');
        } catch (error) {
            response.error(res, error, 'Failed to Created a ticket')
        }
    },
    async findAll(req: IReqUser, res: Response) {
        try {
            const {
                limit = 10,
                page = 1,
                search
            } = req.query as unknown as IPaginationQuery;

            const query: FilterQuery<TypeTicket> = {}

            if (search) {
                Object.assign(query, {
                    ...query,
                    $text: {
                        $search: search
                    }
                })
            }

            const result = await TicketModel.find(query)
                .populate("events")
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .exec();

            const count = await TicketModel.countDocuments(query);

            response.pagination(res, result, {
                total: count,
                current: page,
                totalPages: Math.ceil(count / limit),
            }, 'success find all ticket')

        } catch (error) {
            response.error(res, error, 'Failed to find all ticket');
        }
    },
    async findOne(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                response.notFound(res, 'Failed find one a ticket')
            }

            const result = await TicketModel.findById(id);

            if (!result) {
                response.notFound(res, 'Failed find one a ticket')
            }

            response.success(res, result, 'succes find one ticket');
        } catch (error) {
            response.error(res, error, 'Failed to find one ticket');
        }
    },
    async update(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                response.notFound(res, 'Failed update a ticket')
            }

            const result = await TicketModel.findByIdAndUpdate(id, req.body,
                { new: true });

            response.success(res, result, 'succes update ticket');
        } catch (error) {
            response.error(res, error, 'Failed to update a ticket')
        }
    },
    async remove(req: IReqUser, res: Response) {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                response.notFound(res, 'Failed remove a ticket')
            }

            const result = await TicketModel.findByIdAndDelete(id,
                { new: true });

            response.success(res, result, 'succes delete ticket');
        } catch (error) {
            response.error(res, error, 'Failed to remove a ticket')
        }
    },
    async findAllByEvent(req: IReqUser, res: Response) {
        try {
            const { eventId } = req.params;

            if (!isValidObjectId(eventId)) {
                return response.error(res, null, 'tickets not found')
            }

            const result = await TicketModel.find({ events: eventId }).exec();
            response.success(res, result, "success find all tickets by an event")
        } catch (error) {
            response.error(res, error, 'Failed to find all ticket by event');
        }
    },
}