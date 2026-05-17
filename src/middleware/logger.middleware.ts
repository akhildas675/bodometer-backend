import { Request, Response, NextFunction } from "express";
import logger from "../config/logger.config";

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info(
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
      `${req.method} ${req.url}`,
    );
  });

  next();
};
