import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { STATUS } from "@/constants/constant.values.ts/statuscode";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body as unknown,
        query: req.query,
        params: req.params,
        file: req.file,
        files: req.files,
      }) as Record<string, unknown>;

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) {
        for (const key in req.query) delete req.query[key];
        Object.assign(req.query, parsed.query);
      }
      if (parsed.params !== undefined) {
        for (const key in req.params) delete req.params[key];
        Object.assign(req.params, parsed.params);
      }


      return next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e) => {
          let msg = e.message;
          if (e.code === "invalid_type" && ((e as unknown) as Record<string, unknown>)["received"] === "undefined") {
            const field = e.path[e.path.length - 1];
            msg = `${field ? String(field).charAt(0).toUpperCase() + String(field).slice(1) : 'Field'} is required`;
          }
          if (msg.includes("Invalid input") || msg.includes("received undefined")) {
            const field = e.path[e.path.length - 1];
            msg = `${field ? String(field).charAt(0).toUpperCase() + String(field).slice(1) : 'Field'} is required`;
          }
          return {
            path: e.path.join("."),
            message: msg,
          };
        });

        const firstError = errors[0];
        const topMessage = firstError?.message ?? "Validation error";

        return res.status(STATUS.BAD_REQUEST).json({
          success: false,
          message: topMessage,
          errors,
        });
      }

      if (error instanceof Error) {
        return next(error);
      } else {
        return next(new Error("Unknown error occurred"));
      }
    }
  };
