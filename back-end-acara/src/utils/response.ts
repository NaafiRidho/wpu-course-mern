import { Response } from "express";
import mongoose from "mongoose";
import * as Yup from "yup";

type Pagination = {
  totalPages: number;
  current: number;
  total: number;
};

function getMongoMessage(err: any, fallback: string) {
  return err?.errorResponse?.errmsg || err?.message || fallback;
}

export default {
  success(res: Response, data: any, message: string) {
    res.status(200).json({
      meta: {
        status: 200,
        message,
      },
      data,
    });
  },

  error(res: Response, error: unknown, message: string) {
    // yup validation error
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({
        meta: {
          status: 400,
          message,
        },
        data: {
          [error.path || "validation"]: error.errors[0],
        },
      });
    }

    // mongoose error
    if (error instanceof mongoose.Error) {
      return res.status(500).json({
        meta: {
          status: 500,
          message: error.message,
        },
        data: error.name,
      });
    }

    // mongo duplicate key / driver error
    if ((error as any)?.code) {
      const _err = error as any;
      return res.status(500).json({
        meta: {
          status: 500,
          message: getMongoMessage(_err, message),
        },
        data: {
          code: _err.code,
          name: _err.name,
          message: _err.message,
        },
      });
    }

    // fallback error
    return res.status(500).json({
      meta: {
        status: 500,
        message,
      },
      data: error,
    });
  },

  notFound(res: Response, message: string = "not found") {
    res.status(404).json({
      meta: {
        status: 404,
        message,
      },
      data: null,
    });
  },

  unauthorized(res: Response, message: string = "unauthorized") {
    res.status(403).json({
      meta: {
        status: 403,
        message,
      },
      data: null,
    });
  },

  pagination(
    res: Response,
    data: any[],
    pagination: Pagination,
    message: string
  ) {
    res.status(200).json({
      meta: {
        status: 200,
        message,
      },
      data,
      pagination,
    });
  },
};
