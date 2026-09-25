import { injectable } from "inversify";
import { PipelineStage } from "mongoose";
import { BaseRepository } from "@/modules/base/repository/base.repository";
import {
  FinancialTransactionModel,
  IFinancialTransactionDocument,
} from "../model/financial-transaction.model";
import {
  FinancialTransaction,
  CreateFinancialTransactionInput,
} from "../interface/financial-transaction.interface";
import { IFinancialTransactionRepository } from "../interface/finance-repository.interface";
import {
  TransactionQueryFilter,
  TrainerEarningTotals,
  PlatformEarningTotals,
  TrainerChartPoint,
  AdminChartPoint,
  ChartPeriod,
} from "../interface/finance-query.interface";
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from "../constant/finance.constant";
import { PaginatedResult } from "@/modules/base/interface/common.interface";

@injectable()
export class FinancialTransactionRepository
  extends BaseRepository<FinancialTransaction, IFinancialTransactionDocument>
  implements IFinancialTransactionRepository
{
  constructor() {
    super(FinancialTransactionModel);
  }

  protected toInterface(doc: IFinancialTransactionDocument): FinancialTransaction {
    return {
      id: doc._id.toString(),
      bookingId: doc.bookingId ?? undefined,
      paymentId: doc.paymentId ?? undefined,
      userId: doc.userId ?? undefined,
      trainerId: doc.trainerId,
      grossAmount: doc.grossAmount,
      trainerAmount: doc.trainerAmount,
      platformAmount: doc.platformAmount,
      trainerPercentage: doc.trainerPercentage,
      platformPercentage: doc.platformPercentage,
      currency: doc.currency,
      transactionType: doc.transactionType,
      status: doc.status,
      referenceKey: doc.referenceKey,
      relatedTransactionId: doc.relatedTransactionId ?? undefined,
      note: doc.note ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createOne(
    input: CreateFinancialTransactionInput,
  ): Promise<FinancialTransaction> {
    return this.create(input as Partial<IFinancialTransactionDocument>);
  }

  async findByReferenceKey(
    referenceKey: string,
  ): Promise<FinancialTransaction | null> {
    const doc = await FinancialTransactionModel.findOne({ referenceKey }).exec();
    return doc ? this.toInterface(doc) : null;
  }

  async findByBookingId(bookingId: string): Promise<FinancialTransaction[]> {
    const docs = await FinancialTransactionModel.find({ bookingId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((d) => this.toInterface(d));
  }

  async findByTrainerIdPaginated(
    trainerId: string,
    filter: TransactionQueryFilter,
  ): Promise<PaginatedResult<FinancialTransaction>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(50, Math.max(1, filter.limit ?? 10));
    const skip = (page - 1) * limit;

    const match: Record<string, unknown> = { trainerId };
    if (filter.transactionType !== undefined) {
      match.transactionType = filter.transactionType;
    }
    if (filter.status !== undefined) {
      match.status = filter.status;
    }
    if (filter.from !== undefined || filter.to !== undefined) {
      const dateFilter: Record<string, Date> = {};
      if (filter.from !== undefined) dateFilter.$gte = filter.from;
      if (filter.to !== undefined) dateFilter.$lte = filter.to;
      match.createdAt = dateFilter;
    }

    const [docs, totalItems] = await Promise.all([
      FinancialTransactionModel.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      FinancialTransactionModel.countDocuments(match).exec(),
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
    filter: TransactionQueryFilter,
  ): Promise<PaginatedResult<FinancialTransaction>> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(50, Math.max(1, filter.limit ?? 10));
    const skip = (page - 1) * limit;

    const match: Record<string, unknown> = {};
    if (filter.transactionType !== undefined) {
      match.transactionType = filter.transactionType;
    }
    if (filter.status !== undefined) {
      match.status = filter.status;
    }
    if (filter.from !== undefined || filter.to !== undefined) {
      const dateFilter: Record<string, Date> = {};
      if (filter.from !== undefined) dateFilter.$gte = filter.from;
      if (filter.to !== undefined) dateFilter.$lte = filter.to;
      match.createdAt = dateFilter;
    }

    const [docs, totalItems] = await Promise.all([
      FinancialTransactionModel.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      FinancialTransactionModel.countDocuments(match).exec(),
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

  async reverseTransaction(id: string): Promise<FinancialTransaction | null> {
    const doc = await FinancialTransactionModel.findByIdAndUpdate(
      id,
      { $set: { status: TRANSACTION_STATUS.REVERSED } },
      { new: true },
    ).exec();
    return doc ? this.toInterface(doc) : null;
  }

  async aggregateTrainerEarnings(trainerId: string): Promise<TrainerEarningTotals> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          trainerId,
          status: TRANSACTION_STATUS.COMPLETED,
          transactionType: {
            $in: [TRANSACTION_TYPE.SESSION_EARNING, TRANSACTION_TYPE.REFUND],
          },
        },
      },
      {
        $group: {
          _id: "$transactionType",
          total: { $sum: "$trainerAmount" },
        },
      },
    ];

    const results = await FinancialTransactionModel.aggregate<{
      _id: string;
      total: number;
    }>(pipeline).exec();

    let totalEarned = 0;
    let totalRefunded = 0;

    for (const row of results) {
      if (row._id === TRANSACTION_TYPE.SESSION_EARNING) {
        totalEarned = row.total;
      } else if (row._id === TRANSACTION_TYPE.REFUND) {
        totalRefunded = row.total;
      }
    }

    return { totalEarned, totalRefunded };
  }

  async aggregatePlatformEarnings(): Promise<PlatformEarningTotals> {
    const [earningsResult, refundResult] = await Promise.all([
      FinancialTransactionModel.aggregate<{
        grossRevenue: number;
        totalTrainerEarnings: number;
        totalPlatformEarnings: number;
      }>([
        {
          $match: {
            transactionType: TRANSACTION_TYPE.SESSION_EARNING,
            status: TRANSACTION_STATUS.COMPLETED,
          },
        },
        {
          $group: {
            _id: null,
            grossRevenue: { $sum: "$grossAmount" },
            totalTrainerEarnings: { $sum: "$trainerAmount" },
            totalPlatformEarnings: { $sum: "$platformAmount" },
          },
        },
      ]).exec(),

      FinancialTransactionModel.aggregate<{ totalRefunded: number }>([
        {
          $match: {
            transactionType: TRANSACTION_TYPE.REFUND,
            status: TRANSACTION_STATUS.COMPLETED,
          },
        },
        {
          $group: {
            _id: null,
            totalRefunded: { $sum: "$grossAmount" },
          },
        },
      ]).exec(),
    ]);

    return {
      grossRevenue: earningsResult[0]?.grossRevenue ?? 0,
      totalTrainerEarnings: earningsResult[0]?.totalTrainerEarnings ?? 0,
      totalPlatformEarnings: earningsResult[0]?.totalPlatformEarnings ?? 0,
      totalRefunded: refundResult[0]?.totalRefunded ?? 0,
    };
  }

  async aggregateTrainerChart(
    trainerId: string,
    period: ChartPeriod,
    from: Date,
    to: Date,
  ): Promise<TrainerChartPoint[]> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          trainerId,
          transactionType: TRANSACTION_TYPE.SESSION_EARNING,
          status: TRANSACTION_STATUS.COMPLETED,
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: this.buildLabelExpression(period),
          earnings: { $sum: "$trainerAmount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          label: "$_id",
          earnings: 1,
        },
      },
    ];

    return FinancialTransactionModel.aggregate<TrainerChartPoint>(pipeline).exec();
  }

  async aggregateAdminChart(
    period: ChartPeriod,
    from: Date,
    to: Date,
  ): Promise<AdminChartPoint[]> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          transactionType: TRANSACTION_TYPE.SESSION_EARNING,
          status: TRANSACTION_STATUS.COMPLETED,
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: this.buildLabelExpression(period),
          grossRevenue: { $sum: "$grossAmount" },
          trainerEarnings: { $sum: "$trainerAmount" },
          platformEarnings: { $sum: "$platformAmount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          label: "$_id",
          grossRevenue: 1,
          trainerEarnings: 1,
          platformEarnings: 1,
        },
      },
    ];

    return FinancialTransactionModel.aggregate<AdminChartPoint>(pipeline).exec();
  }

  private buildLabelExpression(period: ChartPeriod): unknown {
    if (period === "daily") {
      return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }
    if (period === "weekly") {
      return {
        $concat: [
          { $toString: { $isoWeekYear: "$createdAt" } },
          "-W",
          {
            $cond: [
              { $lt: [{ $isoWeek: "$createdAt" }, 10] },
              { $concat: ["0", { $toString: { $isoWeek: "$createdAt" } }] },
              { $toString: { $isoWeek: "$createdAt" } },
            ],
          },
        ],
      };
    }
    return { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
  }
}
