import {
  ISubscriptionPlan,
  SubscriptionPlanModel,
} from "@/models/subscription-plan.model";
import { ISubscriptionFeature } from "@/models/subscription-feature.model";
import { BaseRepository } from "@/repositories/base/base.repository";
import { Types } from "mongoose";
import { LimitType } from "@/constants/subscription.constant";
import {
  GetAllSubscriptionPlansResponse,
  SubscriptionPlan,
  SubscriptionPlanQuery,
} from "@/interfaces/domain.interface/subscription.interface";
import { ISubscriptionPlanRepository } from "@/interfaces/repository-interface/subscription/subscription-plan.repository";

export default class SubscriptionPlanRepository
  extends BaseRepository<SubscriptionPlan, ISubscriptionPlan>
  implements ISubscriptionPlanRepository
{
  constructor() {
    super(SubscriptionPlanModel);
  }

  protected toInterface(doc: ISubscriptionPlan): SubscriptionPlan {
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

  async createSubscriptionPlan(
    data: SubscriptionPlan,
  ): Promise<SubscriptionPlan> {
    return await this.create(data);
  }

  async getAllSubscriptionPlans(
    query: SubscriptionPlanQuery,
  ): Promise<GetAllSubscriptionPlansResponse> {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;
    const sortOptions: { [key: string]: 1 | -1 } = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    const filter: Record<string, unknown> = {};
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

  async getSubscriptionPlanById(
    subscriptionPlanId: string,
  ): Promise<SubscriptionPlan | null> {
    return await this.findById(subscriptionPlanId);
  }

  async updateSubscriptionPlan(
    subscriptionPlanId: string,
    data: Partial<SubscriptionPlan>,
  ): Promise<SubscriptionPlan | null> {
    const updateFields: Partial<ISubscriptionPlan> = {};

    if (data.name !== undefined) updateFields.name = data.name;
    if (data.description !== undefined)
      updateFields.description = data.description;
    if (data.price !== undefined) updateFields.price = data.price;
    if (data.durationInDays !== undefined)
      updateFields.durationInDays = data.durationInDays;
    if (data.isPopular !== undefined) updateFields.isPopular = data.isPopular;
    if (data.isActive !== undefined) updateFields.isActive = data.isActive;

    if (data.features !== undefined) {
      updateFields.features = data.features.map((f) => ({
        featureId: new Types.ObjectId(f.featureId),
        limit: f.limit,
        limitType: f.limitType as LimitType,
      }));
    }

    return await this.updateById(subscriptionPlanId, updateFields);
  }

  async toggleSubscriptionPlanStatus(
    subscriptionPlanId: string,
  ): Promise<SubscriptionPlan | null> {
    const plan = await this.findById(subscriptionPlanId);
    if (!plan) return null;

    const updateData: Partial<ISubscriptionPlan> = {
      isActive: !(plan.isActive ?? true),
    };

    return await this.updateById(subscriptionPlanId, updateData);
  }

  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[] | null> {
    type PopulatedDoc = Omit<ISubscriptionPlan, "features"> & {
      features: {
        featureId: ISubscriptionFeature;
        limit?: number;
        limitType?: string;
      }[];
    };

    const rawPlans = await this.model
      .find({ isActive: true })
      .populate("features.featureId")
      .lean()
      .exec();

    const populatedPlans = rawPlans as unknown as PopulatedDoc[];

    return populatedPlans.map((plan) => {
      const base = this.toInterface(plan as unknown as ISubscriptionPlan);
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
    }) as unknown as SubscriptionPlan[];
  }
}
