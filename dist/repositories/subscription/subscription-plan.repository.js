"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_plan_model_1 = require("../../models/subscription-plan.model");
const base_repository_1 = require("../../repositories/base/base.repository");
const mongoose_1 = require("mongoose");
class SubscriptionPlanRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(subscription_plan_model_1.SubscriptionPlanModel);
    }
    toInterface(doc) {
        return {
            subscriptionPlanId: doc._id.toString(),
            planId: doc._id.toString(),
            name: doc.name,
            description: doc.description?.toString() ?? "",
            price: doc.price,
            durationInDays: doc.durationInDays,
            features: doc.features.map((feature) => ({
                featureId: feature.featureId.toString(),
                limit: feature.limit,
                limitType: feature.limitType?.toString(),
            })),
            featuresCount: doc.features?.length || 0,
            isPopular: doc.isPopular,
            isActive: doc.isActive,
            createdAt: doc.createdAt?.toISOString(),
            updatedAt: doc.updatedAt?.toISOString(),
        };
    }
    async createSubscriptionPlan(data) {
        return await this.create(data);
    }
    async getAllSubscriptionPlans(query) {
        const { search, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", } = query;
        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
        const filter = {};
        if (search) {
            filter.$text = { $search: search };
        }
        const total = await this.countDocuments(filter);
        const plans = await this.model
            .find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();
        return {
            data: plans.map((plan) => this.toInterface(plan)),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit) || 1,
                totalItems: total,
                itemsPerPage: limit,
            },
        };
    }
    async getSubscriptionPlanById(subscriptionPlanId) {
        return await this.findById(subscriptionPlanId);
    }
    async updateSubscriptionPlan(subscriptionPlanId, data) {
        const updateFields = {};
        if (data.name !== undefined)
            updateFields.name = data.name;
        if (data.description !== undefined)
            updateFields.description = data.description;
        if (data.price !== undefined)
            updateFields.price = data.price;
        if (data.durationInDays !== undefined)
            updateFields.durationInDays = data.durationInDays;
        if (data.isPopular !== undefined)
            updateFields.isPopular = data.isPopular;
        if (data.isActive !== undefined)
            updateFields.isActive = data.isActive;
        if (data.features !== undefined) {
            updateFields.features = data.features.map((f) => ({
                featureId: new mongoose_1.Types.ObjectId(f.featureId),
                limit: f.limit,
                limitType: f.limitType,
            }));
        }
        return await this.updateById(subscriptionPlanId, updateFields);
    }
    async toggleSubscriptionPlanStatus(subscriptionPlanId) {
        const plan = await this.findById(subscriptionPlanId);
        if (!plan)
            return null;
        const updateData = {
            isActive: !(plan.isActive ?? true),
        };
        return await this.updateById(subscriptionPlanId, updateData);
    }
    async getActiveSubscriptionPlans() {
        const rawPlans = await this.model
            .find({ isActive: true })
            .populate("features.featureId")
            .lean()
            .exec();
        const populatedPlans = rawPlans;
        return populatedPlans.map((plan) => {
            const base = this.toInterface(plan);
            return {
                ...base,
                features: plan.features
                    .filter((f) => f && f.featureId)
                    .map((f) => ({
                    featureId: String(f.featureId?._id || f.featureId),
                    title: f.featureId?.title || "Feature",
                    limit: f.limit,
                    limitType: f.limitType,
                })),
            };
        });
    }
}
exports.default = SubscriptionPlanRepository;
