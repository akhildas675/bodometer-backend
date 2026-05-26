"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscriptionRepository = void 0;
const user_subscription_model_1 = require("../models/user-subscription.model");
const mongoose_1 = __importDefault(require("mongoose"));
class UserSubscriptionRepository {
    async create(data) {
        return user_subscription_model_1.UserSubscriptionModel.create(data);
    }
    async findActiveByUserId(userId) {
        return user_subscription_model_1.UserSubscriptionModel.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            status: "active",
            endDate: { $gte: new Date() },
        })
            .populate("subscriptionPlanId", "name description price durationInDays")
            .lean();
    }
}
exports.UserSubscriptionRepository = UserSubscriptionRepository;
