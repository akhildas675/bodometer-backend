import { ZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("VALIDATE MIDDLEWARE - body:", req.body);

      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));

        const firstError = errors[0];
        const topMessage = firstError?.message ?? "Validation error";

        return res.status(400).json({
          success: false,
          message: topMessage,
          errors,
        });
      }

      return next(error);
    }
  };
