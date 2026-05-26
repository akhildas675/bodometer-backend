"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_feature_model_1 = require("../models/subscription-feature.model");
const base_repository_1 = require("./base/base.repository");
class SubscriptionFeatureRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(subscription_feature_model_1.SubscriptionFeatureModel);
    }
    toInterface(doc) {
        return {
            subscriptionFeatureId: doc._id.toString(),
            key: doc.key,
            title: doc.title,
            description: doc.description,
            type: doc.type,
            isActive: doc.isActive,
        };
    }
    async createSubscriptionFeature(data) {
        return this.create(data);
    }
    async getSubscriptionFeatureById(id) {
        return this.findById(id);
    }
    async getAllSubscriptionFeatures(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
        }
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive;
        }
        const [docs, totalItems] = await Promise.all([
            subscription_feature_model_1.SubscriptionFeatureModel.find(filter).skip(skip).limit(limit).exec(),
            subscription_feature_model_1.SubscriptionFeatureModel.countDocuments(filter).exec(),
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            data: docs.map((doc) => this.toInterface(doc)),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
            },
        };
    }
    async updateSubscriptionFeature(id, featureData) {
        return this.updateById(id, featureData);
    }
    async toggleSubscriptionFeatureStatus(id) {
        const feature = await this.findById(id);
        if (!feature) {
            throw new Error("Subscription feature not found");
        }
        return this.updateById(id, { isActive: !feature.isActive });
    }
}
exports.default = SubscriptionFeatureRepository;
