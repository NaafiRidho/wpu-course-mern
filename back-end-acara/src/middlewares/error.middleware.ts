import { NextFunction, Response, Request } from "express";
import response from "../utils/response";

export default {
    serverRoute() {
        return (req: Request, res: Response, next: NextFunction) => {
            response.notFound(res, 'Route Not Found');
        };
    },
    serverError() {
        return (err: Error, req: Request, res: Response, next: NextFunction) => {
            response.error(res, err, err.message);
        };
    },
}