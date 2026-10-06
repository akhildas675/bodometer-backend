import { injectable } from "inversify";
import mongoose, { PipelineStage } from "mongoose";
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
import { BookingModel } from "@/modules/booking/model/booking.model";

@injectable()
export class FinancialTransactionRepository
  extends BaseRepository<FinancialTransaction, IFinancialTransactionDocument>
  implements IFinancialTransactionRepository
{
  constructor() {
    super(FinancialTransactionModel);
  }

  protected toInterface(
    doc: IFinancialTransactionDocument,
    fallbackServiceName?: string,
  ): FinancialTransaction {
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
      serviceName: doc.serviceName ?? fallbackServiceName ?? undefined,
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
    const bookingMap = await this.getBookingServiceMap(docs);

    return {
      data: docs.map((d) =>
        this.toInterface(
          d,
          d.bookingId ? bookingMap.get(d.bookingId) : undefined,
        ),
      ),
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
    const bookingMap = await this.getBookingServiceMap(docs);

    return {
      data: docs.map((d) =>
        this.toInterface(
          d,
          d.bookingId ? bookingMap.get(d.bookingId) : undefined,
        ),
      ),
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

  private async getBookingServiceMap(
    docs: IFinancialTransactionDocument[],
  ): Promise<Map<string, string>> {
    const bookingIdsToFetch = docs
      .filter((d) => !d.serviceName && d.bookingId)
      .map((d) => d.bookingId as string);

    const bookingMap = new Map<string, string>();
    if (bookingIdsToFetch.length > 0) {
      const validIds = bookingIdsToFetch.filter((id) =>
        mongoose.isValidObjectId(id),
      );
      if (validIds.length > 0) {
        const bookings = await BookingModel.find(
          { _id: { $in: validIds } },
          { serviceSnapshot: 1 },
        ).lean();
        for (const b of bookings) {
          if (b.serviceSnapshot?.name) {
            bookingMap.set(b._id.toString(), b.serviceSnapshot.name);
          }
        }
      }
    }
    return bookingMap;
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

    const rawResults = await FinancialTransactionModel.aggregate<TrainerChartPoint>(pipeline).exec();
    const dataMap = new Map<string, number>();
    for (const row of rawResults) {
      if (row.label) {
        dataMap.set(row.label, row.earnings);
      }
    }

    const buckets = this.generateBuckets(period, from, to);
    return buckets.map((label) => ({
      label,
      earnings: dataMap.get(label) ?? 0,
    }));
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

    const rawResults = await FinancialTransactionModel.aggregate<AdminChartPoint>(pipeline).exec();
    const dataMap = new Map<string, AdminChartPoint>();
    for (const row of rawResults) {
      if (row.label) {
        dataMap.set(row.label, row);
      }
    }

    const buckets = this.generateBuckets(period, from, to);
    return buckets.map((label) => {
      const item = dataMap.get(label);
      return {
        label,
        grossRevenue: item?.grossRevenue ?? 0,
        trainerEarnings: item?.trainerEarnings ?? 0,
        platformEarnings: item?.platformEarnings ?? 0,
      };
    });
  }

  private generateBuckets(period: ChartPeriod, from: Date, to: Date): string[] {
    const buckets: string[] = [];
    const current = new Date(from);
    const end = new Date(to);

    if (period === "daily") {
      while (current <= end) {
        buckets.push(current.toISOString().slice(0, 10));
        current.setUTCDate(current.getUTCDate() + 1);
      }
    } else if (period === "weekly") {
      const seen = new Set<string>();
      while (current <= end) {
        const label = this.getIsoWeekLabel(current);
        if (!seen.has(label)) {
          seen.add(label);
          buckets.push(label);
        }
        current.setUTCDate(current.getUTCDate() + 7);
      }
      const endLabel = this.getIsoWeekLabel(end);
      if (!seen.has(endLabel)) {
        seen.add(endLabel);
        buckets.push(endLabel);
      }
    } else {
      const seen = new Set<string>();
      while (current <= end) {
        const yr = current.getUTCFullYear();
        const mo = String(current.getUTCMonth() + 1).padStart(2, "0");
        const label = `${yr}-${mo}`;
        if (!seen.has(label)) {
          seen.add(label);
          buckets.push(label);
        }
        current.setUTCMonth(current.getUTCMonth() + 1);
        current.setUTCDate(1);
      }
      const endLabel = `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, "0")}`;
      if (!seen.has(endLabel)) {
        seen.add(endLabel);
        buckets.push(endLabel);
      }
    }

    return buckets;
  }

  private getIsoWeekLabel(d: Date): string {
    const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
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
