"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIMIT_TYPES = exports.PAYMENT_GATEWAYS = exports.TRANSACTION_STATUSES = exports.SUBSCRIPTION_STATUSES = exports.FEATURE_TYPES = void 0;
exports.FEATURE_TYPES = [
    "boolean",
    "limit"
];
exports.SUBSCRIPTION_STATUSES = [
    "active",
    "expired",
    "cancelled"
];
exports.TRANSACTION_STATUSES = [
    "pending",
    "success",
    "failed",
    "refunded"
];
exports.PAYMENT_GATEWAYS = [
    "stripe",
    "razorpay",
    "manual"
];
exports.LIMIT_TYPES = [
    "daily",
    "weekly",
    "monthly"
];
