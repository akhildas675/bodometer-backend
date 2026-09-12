import { NextFunction, Request, Response, } from "express";
import { AppError } from "../utils/appError";
import { STATUS } from "../constants/constant.values.ts/statuscode";

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

interface MongooseValidationError extends Error {
  errors?: Record<string, { path: string; message: string }>;
}
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Global Error Handler Catch:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // Handle Mongoose/MongoDB Errors
  if (err instanceof Error) {
    const errorName = err.name;

    // Handle MongoDB Duplicate Key Error
    if (errorName === "MongoServerError" && (err as MongoError).code === 11000) {
      const field = Object.keys((err as MongoError).keyValue || {})[0];
      const message = field 
        ? `A record with this ${field} already exists.`
        : "A record with this value already exists.";
      return res.status(STATUS.CONFLICT).json({
        success: false,
        message,
      });
    }

    // Handle Mongoose Validation Error
    if (errorName === "ValidationError") {
      const errors: Record<string, string> = {};
      Object.values((err as MongooseValidationError).errors || {}).forEach((e) => {
        errors[e.path] = e.message;
      });
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid input data.",
        errors,
      });
    }

    // Handle Mongoose Cast Error (Invalid ID)
    if (errorName === "CastError") {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid ID format provided.",
      });
    }
  }

  // Generic fallback for all other errors to mask internal implementation details
  const defaultMessage = process.env.NODE_ENV === 'development' && err instanceof Error 
    ? err.message 
    : "Something went wrong. Please try again later.";

  return res.status(STATUS.INTERNAL_ERROR).json({
    success: false,
    message: defaultMessage,
  });
};
