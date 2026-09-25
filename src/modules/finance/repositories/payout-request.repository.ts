import { injectable } from "inversify";
import { PipelineStage } from "mongoose";
import { BaseRepository } from "@/modules/base/repository/base.repository";
import {
  PayoutRequestModel,
  IPayoutRequestDocument,
} from "../model/payout-request.model";
import {
  PayoutRequest,
  CreatePayoutRequestInput,
  UpdatePayoutStatusInput,
} from "../interface/payout-request.interface";
import { IPayoutRequestRepository } from "../interface/payout-repository.interface";
import {
  PayoutQueryFilter,
  PayoutTotals,
  AdminPayoutSummary,
} from "../interface/payout-query.interface";
import { PAYOUT_STATUS } from "../constant/finance.constant";
import { PaginatedResult } from "@/modules/base/interface/common.interface";

const ACTIVE_PAYOUT_STATUSES = [
  PAYOUT_STATUS.PENDING,
  PAYOUT_STATUS.APPROVED,
  PAYOUT_STATUS.PROCESSING,
  PAYOUT_STATUS.FAILED,
];

@injectable()
export class PayoutRequestRepository
  extends BaseRepository<PayoutRequest, IPayoutRequestDocument>
  implements IPayoutRequestRepository
{
  constructor() {
    super(PayoutRequestModel);
  }

  protected toInterface(doc: IPayoutRequestDocument): PayoutRequest {
    return {
      id: doc._id.toString(),
      trainerId: doc.trainerId,
      amount: doc.amount,
      reservedAmount: doc.reservedAmount,
      currency: doc.currency,
      status: doc.status,
      providerPayoutId: doc.providerPayoutId ?? undefined,
      rejectionReason: doc.rejectionReason ?? undefined,
      failureReason: doc.failureReason ?? undefined,
      requestedAt: doc.requestedAt,
      approvedAt: doc.approvedAt ?? undefined,
      processedAt: doc.processedAt ?? undefined,
      completedAt: doc.completedAt ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createOne(
    input: CreatePayoutRequestInput,
  ): Promise<PayoutRequest> {
    return this.create(input as Partial<IPayoutRequestDocument>);
  }

  async findActiveByTrainerId(trainerId: string): Promise<PayoutRequest | null> {
    const doc = await PayoutRequestModel.findOne({
      trainerId,
      status: { $in: ACTIVE_PAYOUT_STATUSES },
    }).exec();
    return doc ? this.toInterface(doc) : null;
  }

  async findByTrainerIdPaginated(
    trainerId: string,
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(50, Math.max(1, filter.limit ?? 10));
    const skip = (page - 1) * limit;

    const match: Record<string, unknown> = { trainerId };
    if (filter.status !== undefined) {
      match.status = filter.status;
    }
    if (filter.from !== undefined || filter.to !== undefined) {
      const dateFilter: Record<string, Date> = {};
      if (filter.from !== undefined) dateFilter.$gte = filter.from;
      if (filter.to !== undefined) dateFilter.$lte = filter.to;
      match.requestedAt = dateFilter;
    }

    const [docs, totalItems] = await Promise.all([
      PayoutRequestModel.find(match)
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      PayoutRequestModel.countDocuments(match).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: docs.map((d) => this.toInterface(d)),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findAllPaginated(
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(50, Math.max(1, filter.limit ?? 10));
    const skip = (page - 1) * limit;

    const match: Record<string, unknown> = {};
    if (filter.status !== undefined) {
      match.status = filter.status;
    }
    if (filter.from !== undefined || filter.to !== undefined) {
      const dateFilter: Record<string, Date> = {};
      if (filter.from !== undefined) dateFilter.$gte = filter.from;
      if (filter.to !== undefined) dateFilter.$lte = filter.to;
      match.requestedAt = dateFilter;
    }

    const [docs, totalItems] = await Promise.all([
      PayoutRequestModel.find(match)
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      PayoutRequestModel.countDocuments(match).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: docs.map((d) => this.toInterface(d)),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updatePayoutStatus(
    id: string,
    input: UpdatePayoutStatusInput,
  ): Promise<PayoutRequest | null> {
    const updateFields: Record<string, unknown> = { status: input.status };

    if (input.providerPayoutId !== undefined) {
      updateFields.providerPayoutId = input.providerPayoutId;
    }
    if (input.rejectionReason !== undefined) {
      updateFields.rejectionReason = input.rejectionReason;
    }
    if (input.failureReason !== undefined) {
      updateFields.failureReason = input.failureReason;
    }
    if (input.approvedAt !== undefined) {
      updateFields.approvedAt = input.approvedAt;
    }
    if (input.processedAt !== undefined) {
      updateFields.processedAt = input.processedAt;
    }
    if (input.completedAt !== undefined) {
      updateFields.completedAt = input.completedAt;
    }

    const doc = await PayoutRequestModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true },
    ).exec();

    return doc ? this.toInterface(doc) : null;
  }

  async getPayoutTotalsByTrainerId(trainerId: string): Promise<PayoutTotals> {
    const pipeline: PipelineStage[] = [
      { $match: { trainerId } },
      {
        $group: {
          _id: null,
          totalReserved: {
            $sum: {
              $cond: [
                { $in: ["$status", ACTIVE_PAYOUT_STATUSES] },
                "$reservedAmount",
                0,
              ],
            },
          },
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ["$status", PAYOUT_STATUS.PAID] }, "$amount", 0],
            },
          },
        },
      },
    ];

    const result = await PayoutRequestModel.aggregate<{
      totalReserved: number;
      totalPaid: number;
    }>(pipeline).exec();

    return {
      totalReserved: result[0]?.totalReserved ?? 0,
      totalPaid: result[0]?.totalPaid ?? 0,
    };
  }

  async getAdminPayoutSummary(): Promise<AdminPayoutSummary> {
    const pipeline: PipelineStage[] = [
      {
        $group: {
          _id: null,
          pendingAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", PAYOUT_STATUS.PENDING] },
                "$reservedAmount",
                0,
              ],
            },
          },
          paidAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", PAYOUT_STATUS.PAID] },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ];

    const result = await PayoutRequestModel.aggregate<{
      pendingAmount: number;
      paidAmount: number;
    }>(pipeline).exec();

    return {
      pendingAmount: result[0]?.pendingAmount ?? 0,
      paidAmount: result[0]?.paidAmount ?? 0,
    };
  }
}
