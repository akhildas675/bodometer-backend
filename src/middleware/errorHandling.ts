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

  const defaultMessage = err instanceof Error ? err.message : "Internal server error";

  return res.status(STATUS.INTERNAL_ERROR).json({
    success: false,
    message: defaultMessage,
  });
};
