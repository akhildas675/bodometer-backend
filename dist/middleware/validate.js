"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const statuscode_1 = require("../constants/statuscode");
const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
            file: req.file,
            files: req.files,
        });
        if (parsed.body !== undefined)
            req.body = parsed.body;
        if (parsed.query !== undefined) {
            for (const key in req.query)
                delete req.query[key];
            Object.assign(req.query, parsed.query);
        }
        if (parsed.params !== undefined) {
            for (const key in req.params)
                delete req.params[key];
            Object.assign(req.params, parsed.params);
        }
        return next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = error.issues.map((e) => {
                let msg = e.message;
                if (e.code === "invalid_type" && e["received"] === "undefined") {
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
            return res.status(statuscode_1.STATUS.BAD_REQUEST).json({
                success: false,
                message: topMessage,
                errors,
            });
        }
        if (error instanceof Error) {
            return next(error);
        }
        else {
            return next(new Error("Unknown error occurred"));
        }
    }
};
exports.validate = validate;
