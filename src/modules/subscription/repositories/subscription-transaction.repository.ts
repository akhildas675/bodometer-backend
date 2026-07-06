import {
  SubscriptionTransactionModel,
  ISubscriptionTransaction,
} from "../models/subscription-transaction.model";
import {
  PaymentGateway,
  TransactionStatus,
} from "../constants/subscription.constant";
import { PopulatedSubscriptionTransaction } from "../mapper/subscription.mapper";
import { SubscriptionPlanModel } from "../models/subscription-plan.model";
import { ISubscriptionTransactionRepository } from "../interface/repository.interface/subscription.transaction-repository.interface";
import { SubscriptionTransactionPaginatedResult, SubscriptionTransactionQuery } from "../interface/subscription.interface";
import { injectable } from "inversify";
import mongoose from "mongoose";
import { UserModel } from "@/modules/auth/model/user.model";

@injectable()
export class SubscriptionTransactionRepository implements ISubscriptionTransactionRepository {
  async create(data: {
    userId: string;
    subscriptionPlanId: string;
    userSubscriptionId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    paymentGateway: PaymentGateway;
    transactionId: string;
    paymentStatus: TransactionStatus;
    paidAt: Date;
    meta?: Record<string, unknown>;
  }): Promise<ISubscriptionTransaction> {
    return SubscriptionTransactionModel.create(data);
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<ISubscriptionTransaction | null> {
    return SubscriptionTransactionModel.findOne({
      transactionId,
    }).lean() as Promise<ISubscriptionTransaction | null>;
  }

  async findAllPaginated(
  query:SubscriptionTransactionQuery
  ): Promise<SubscriptionTransactionPaginatedResult> {
    const {
    search,
    sortBy,
    sortOrder,
    page = 1,
    limit = 10,
    status,
  } = query;

    const filter: Record<string, unknown> = {};

    if (status) {
      filter.paymentStatus = status;
    }

    if (search) {
     
      const users = await UserModel.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      const userIds = users.map((u) => u._id);

    
      const plans = await SubscriptionPlanModel.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");
      const planIds = plans.map((p) => p._id);

      filter.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { userId: { $in: userIds } },
        { subscriptionPlanId: { $in: planIds } },
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const pageNum = page || 1;
    const limitNum = limit || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await SubscriptionTransactionModel.countDocuments(filter);
    const docs = await SubscriptionTransactionModel.find(filter)
      .populate("userId", "name email")
      .populate("subscriptionPlanId", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    return {
      data: docs as unknown as PopulatedSubscriptionTransaction[],
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

  async findByUserId(userId: string): Promise<ISubscriptionTransaction[]> {
    return SubscriptionTransactionModel.find({ userId })
      .populate("subscriptionPlanId", "name")
      .sort({ createdAt: -1 })
      .lean() as Promise<ISubscriptionTransaction[]>;
  }

  async findUserTransactionsPaginated(
    userId: string,
    query:SubscriptionTransactionQuery
  ): Promise<SubscriptionTransactionPaginatedResult> {

     const {
    search,
    sortBy,
    sortOrder,
    page = 1,
    limit = 10,
    status,
  } = query;

    const filter: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(userId) };

    if (status) {
      filter.paymentStatus = status;
    }

    if (search) {
      const plans = await SubscriptionPlanModel.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");
      const planIds = plans.map((p) => p._id);

      filter.$and = [
        { userId: new mongoose.Types.ObjectId(userId) },
        {
          $or: [
            { transactionId: { $regex: search, $options: "i" } },
            { subscriptionPlanId: { $in: planIds } },
          ],
        },
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const pageNum = page || 1;
    const limitNum = limit || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await SubscriptionTransactionModel.countDocuments(filter);
    const docs = await SubscriptionTransactionModel.find(filter)
      .populate("subscriptionPlanId", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    return {
      data: docs as unknown as PopulatedSubscriptionTransaction[],
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
