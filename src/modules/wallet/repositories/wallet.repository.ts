import { injectable } from "inversify";
import { ClientSession } from "mongoose";
import {
  UserWallet,
  WalletTransaction,
} from "../interface/domain/wallet.interface";
import { WalletTransactionsQueryDto } from "../dto/wallet.dto";
import {
  IWalletRepository,
  PaginatedTransactionsResult,
} from "../interface/repository.interface/wallet-repository.interface";
import {
  IUserWalletDocument,
  IWalletTransactionDocument,
  UserWalletModel,
  WalletTransactionModel,
} from "../model/wallet.model";

@injectable()
export class WalletRepository implements IWalletRepository {
  protected toWalletInterface(doc: IUserWalletDocument): UserWallet {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      balance: doc.balance,
      currency: doc.currency,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  protected toTransactionInterface(doc: IWalletTransactionDocument): WalletTransaction {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      source: doc.source,
      amount: doc.amount,
      currency: doc.currency,
      bookingId: doc.bookingId,
      refundId: doc.refundId,
      reference: doc.reference,
      description: doc.description,
      createdAt: doc.createdAt,
    };
  }

  async findWalletByUserId(userId: string, session?: ClientSession): Promise<UserWallet | null> {
    const doc = await UserWalletModel.findOne({ userId }, null, { session }).exec();
    return doc ? this.toWalletInterface(doc) : null;
  }

  async createWallet(userId: string, initialBalance: number = 0, session?: ClientSession): Promise<UserWallet> {
    const docs = await UserWalletModel.create(
      [{ userId, balance: initialBalance, currency: "INR" }],
      { session },
    );
    return this.toWalletInterface(docs[0]);
  }

  async updateBalance(userId: string, newBalance: number, session?: ClientSession): Promise<UserWallet | null> {
    const doc = await UserWalletModel.findOneAndUpdate(
      { userId },
      { $set: { balance: newBalance } },
      { new: true, runValidators: true, session },
    ).exec();
    return doc ? this.toWalletInterface(doc) : null;
  }

  async createTransaction(txData: Partial<WalletTransaction>, session?: ClientSession): Promise<WalletTransaction> {
    const payload: Partial<WalletTransaction> = {
      userId: txData.userId,
      type: txData.type,
      source: txData.source,
      amount: txData.amount,
      currency: txData.currency || "INR",
      bookingId: txData.bookingId,
      refundId: txData.refundId,
      reference: txData.reference,
      description: txData.description,
    };

    const docs = await WalletTransactionModel.create([payload], { session });
    return this.toTransactionInterface(docs[0]);
  }

  async findTransactionsByUserId(userId: string): Promise<WalletTransaction[]> {
    const docs = await WalletTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((d) => this.toTransactionInterface(d));
  }

  async findTransactionByReference(reference: string): Promise<WalletTransaction | null> {
    const doc = await WalletTransactionModel.findOne({ reference }).exec();
    return doc ? this.toTransactionInterface(doc) : null;
  }

  async findTransactionsPaginated(
    userId: string,
    query?: WalletTransactionsQueryDto,
  ): Promise<PaginatedTransactionsResult> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Number(query?.limit) || 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId };
    if (query?.type && query.type !== "ALL") {
      filter.type = query.type;
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim();
      const numQ = Number(q);
      const orConditions: Record<string, unknown>[] = [
        { description: { $regex: q, $options: "i" } },
        { source: { $regex: q, $options: "i" } },
        { reference: { $regex: q, $options: "i" } },
        { bookingId: { $regex: q, $options: "i" } },
      ];
      if (!isNaN(numQ)) {
        orConditions.push({ amount: numQ });
      }
      filter.$or = orConditions;
    }

    const sortField = query?.sortBy === "amount" ? "amount" : "createdAt";
    const sortDir: 1 | -1 = query?.sortOrder === "asc" ? 1 : -1;

    const [docs, totalItems, summary] = await Promise.all([
      WalletTransactionModel.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .exec(),
      WalletTransactionModel.countDocuments(filter).exec(),
      WalletTransactionModel.aggregate<{ _id: string; total: number }>([
        { $match: { userId } },
        { $group: { _id: "$type", total: { $sum: "$amount" } } },
      ]).exec(),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    let totalCredits = 0;
    let totalDebits = 0;
    summary.forEach((s) => {
      if (s._id === "CREDIT") totalCredits = s.total;
      if (s._id === "DEBIT") totalDebits = s.total;
    });

    return {
      transactions: docs.map((d) => this.toTransactionInterface(d)),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      totalCredits,
      totalDebits,
    };
  }
}
