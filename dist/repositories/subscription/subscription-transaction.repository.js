"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionTransactionRepository = void 0;
const subscription_transaction_model_1 = require("../../models/subscription-transaction.model");
const subscription_plan_model_1 = require("../../models/subscription-plan.model");
const user_model_1 = require("../../models/user.model");
class SubscriptionTransactionRepository {
    async create(data) {
        return subscription_transaction_model_1.SubscriptionTransactionModel.create(data);
    }
    async findByTransactionId(transactionId) {
        return subscription_transaction_model_1.SubscriptionTransactionModel.findOne({
            transactionId,
        }).lean();
    }
    async findAllPaginated(search, sortBy, sortOrder, page, limit, status) {
        const filter = {};
        if (status) {
            filter.paymentStatus = status;
        }
        if (search) {
            const users = await user_model_1.UserModel.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            }).select("_id");
            const userIds = users.map((u) => u._id);
            const plans = await subscription_plan_model_1.SubscriptionPlanModel.find({
                name: { $regex: search, $options: "i" },
            }).select("_id");
            const planIds = plans.map((p) => p._id);
            filter.$or = [
                { transactionId: { $regex: search, $options: "i" } },
                { userId: { $in: userIds } },
                { subscriptionPlanId: { $in: planIds } },
            ];
        }
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === "desc" ? -1 : 1;
        }
        else {
            sort.createdAt = -1;
        }
        const pageNum = page || 1;
        const limitNum = limit || 10;
        const skip = (pageNum - 1) * limitNum;
        const total = await subscription_transaction_model_1.SubscriptionTransactionModel.countDocuments(filter);
        const docs = await subscription_transaction_model_1.SubscriptionTransactionModel.find(filter)
            .populate("userId", "name email")
            .populate("subscriptionPlanId", "name")
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean();
        return {
            data: docs,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum,
                hasNextPage: pageNum < Math.ceil(total / limitNum),
                hasPreviousPage: pageNum > 1,
            },
        };
    }
    async findByUserId(userId) {
        return subscription_transaction_model_1.SubscriptionTransactionModel.find({ userId })
            .populate("subscriptionPlanId", "name")
            .sort({ createdAt: -1 })
            .lean();
    }
    async findUserTransactionsPaginated(userId, search, sortBy, sortOrder, page, limit, status) {
        const filter = { userId };
        if (status) {
            filter.paymentStatus = status;
        }
        if (search) {
            const plans = await subscription_plan_model_1.SubscriptionPlanModel.find({
                name: { $regex: search, $options: "i" },
            }).select("_id");
            const planIds = plans.map((p) => p._id);
            filter.$and = [
                { userId },
                {
                    $or: [
                        { transactionId: { $regex: search, $options: "i" } },
                        { subscriptionPlanId: { $in: planIds } },
                    ],
                },
            ];
        }
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === "desc" ? -1 : 1;
        }
        else {
            sort.createdAt = -1;
        }
        const pageNum = page || 1;
        const limitNum = limit || 10;
        const skip = (pageNum - 1) * limitNum;
        const total = await subscription_transaction_model_1.SubscriptionTransactionModel.countDocuments(filter);
        const docs = await subscription_transaction_model_1.SubscriptionTransactionModel.find(filter)
            .populate("subscriptionPlanId", "name")
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean();
        return {
            data: docs,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum,
                hasNextPage: pageNum < Math.ceil(total / limitNum),
                hasPreviousPage: pageNum > 1,
            },
        };
    }
}
exports.SubscriptionTransactionRepository = SubscriptionTransactionRepository;
