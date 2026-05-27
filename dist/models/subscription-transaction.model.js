"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionTransactionModel = void 0;
const subscription_constant_1 = require("../constants/subscription.constant");
const mongoose_1 = __importStar(require("mongoose"));
const SubscriptionTransactionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    subscriptionPlanId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
        required: true,
    },
    userSubscriptionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "UserSubscription",
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: "INR",
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentGateway: {
        type: String,
        enum: subscription_constant_1.PAYMENT_GATEWAYS,
        required: true,
    },
    transactionId: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: subscription_constant_1.TRANSACTION_STATUSES,
        default: "pending",
        index: true,
    },
    paidAt: {
        type: Date,
    },
    meta: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, { timestamps: true });
exports.SubscriptionTransactionModel = mongoose_1.default.model("SubscriptionTransaction", SubscriptionTransactionSchema);
