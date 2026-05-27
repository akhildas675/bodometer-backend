"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResponse = void 0;
class SuccessResponse {
    statusCode;
    message;
    data;
    pagination;
    success = true;
    constructor(statusCode, message, data, pagination) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.pagination = pagination;
    }
    send(res) {
        return res.status(this.statusCode).json({
            success: this.success,
            message: this.message,
            ...(this.data !== undefined ? { data: this.data } : {}),
            ...(this.pagination !== undefined ? { pagination: this.pagination } : {}),
        });
    }
}
exports.SuccessResponse = SuccessResponse;
