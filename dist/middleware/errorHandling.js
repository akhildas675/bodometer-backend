"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const appError_1 = require("../utils/appError");
const statuscode_1 = require("../constants/statuscode");
const errorHandler = (err, req, res, next) => {
    console.error("Global Error Handler Catch:", err);
    if (err instanceof appError_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.errors ? { errors: err.errors } : {}),
        });
    }
    const defaultMessage = err instanceof Error ? err.message : "Internal server error";
    return res.status(statuscode_1.STATUS.INTERNAL_ERROR).json({
        success: false,
        message: defaultMessage,
    });
};
exports.errorHandler = errorHandler;
