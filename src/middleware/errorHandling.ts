import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { STATUS } from "../constants/statuscode";


export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  return res.status(STATUS.INTERNAL_ERROR).json({
    success: false,
    message: "Internal server error",
  });
};
