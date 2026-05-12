import { ISubscriptionFeature, SubscriptionFeatureModel } from "@/models/subscription-feature.model";
import { BaseRepository } from "./base/base.repository";
import { SubscriptionFeature, SubscriptionFeatureQuery, PaginatedResult } from "@/interfaces/domain.interface/admin.interface/admin.interface";
import { ISubscriptionFeatureRepository } from "@/interfaces/repository-interface/subscription/feature-repository.interface";

export default class SubscriptionFeatureRepository extends BaseRepository<SubscriptionFeature, ISubscriptionFeature> implements ISubscriptionFeatureRepository {
    constructor() {
        super(SubscriptionFeatureModel)
    }


    protected toInterface(doc: ISubscriptionFeature): SubscriptionFeature {
        return {
            subscriptionFeatureId: doc._id.toString(),
            key: doc.key,
            title: doc.title,
            description: doc.description,
            type: doc.type,
            isActive: doc.isActive,
        };
    }
    async createSubscriptionFeature(data: SubscriptionFeature): Promise<SubscriptionFeature> {
        return this.create(data)
    }

    async getSubscriptionFeatureById(id: string): Promise<SubscriptionFeature | null> {
        return this.findById(id);
    }



    async getAllSubscriptionFeatures(query: SubscriptionFeatureQuery): Promise<PaginatedResult<SubscriptionFeature>> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = {};
        if (query.search) {
            filter.title = { $regex: query.search, $options: 'i' };
        }
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive;
        }

        const [docs, totalItems] = await Promise.all([
            SubscriptionFeatureModel.find(filter).skip(skip).limit(limit).exec(),
            SubscriptionFeatureModel.countDocuments(filter).exec(),
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

    async updateSubscriptionFeature(id: string, featureData: SubscriptionFeature): Promise<SubscriptionFeature | null> {
        return this.updateById(id, featureData);
    }

    async toggleSubscriptionFeatureStatus(id: string): Promise<SubscriptionFeature | null> {
        const feature = await this.findById(id);
        if (!feature) {
            throw new Error('Subscription feature not found');
        }
        return this.updateById(id, { isActive: !feature.isActive });
    }
}