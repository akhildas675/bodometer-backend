import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { STATUS } from "../constants/statuscode";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
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
    if (errorName === "MongoServerError" && (err as any).code === 11000) {
      const field = Object.keys((err as any).keyValue || {})[0];
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
      Object.values((err as any).errors || {}).forEach((e: any) => {
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
