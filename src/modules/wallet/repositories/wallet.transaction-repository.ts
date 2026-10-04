import { injectable } from "inversify";

import { BaseRepository } from "@/modules/base/repository/base.repository";

import {
  WalletTransaction,
} from "../interface/domain/wallet.interface";

import {
  IWalletTransactionDocument,
  WalletTransactionModel,
} from "../model/wallet-transaction.model";

import {
  IWalletTransactionRepository,
  PaginatedWalletTransactionsResult,
} from "../interface/repository.interface/wallet-transaction-repository.interface";

import {
  WALLET_TRANSACTION_TYPE,
  WalletOwnerType,
} from "../constants/wallet.constants";

import {
  WalletTransactionsQueryDto,
} from "../dto/wallet.dto";

interface TransactionTotalResult {
  _id: string;
  total: number;
}

@injectable()
export class WalletTransactionRepository
  extends BaseRepository<
    WalletTransaction,
    IWalletTransactionDocument
  >
  implements IWalletTransactionRepository
{
  constructor() {
    super(WalletTransactionModel);
  }

  protected toInterface(
    doc: IWalletTransactionDocument,
  ): WalletTransaction {
    return {
      id: doc._id.toString(),
      walletId: doc.walletId,
      ownerId: doc.ownerId,
      ownerType: doc.ownerType,
      type: doc.type,
      source: doc.source,
      amount: doc.amount,
      currency: doc.currency,
      bookingId: doc.bookingId,
      refundId: doc.refundId,
      payoutRequestId: doc.payoutRequestId,
      reference: doc.reference,
      description: doc.description,
      createdAt: doc.createdAt,
    };
  }

  async createTransaction(
    transaction: Partial<WalletTransaction>,
  ): Promise<WalletTransaction> {
    return this.create(transaction);
  }

  async findTransactionById(
    transactionId: string,
  ): Promise<WalletTransaction | null> {
    return this.findById(transactionId);
  }

  async findTransactionByReference(
    reference: string,
  ): Promise<WalletTransaction | null> {
    return this.findOne({ reference });
  }

  async findTransactionsByWalletId(
    walletId: string,
  ): Promise<WalletTransaction[]> {
    return this.findAll({ walletId });
  }

  async findTransactionsByOwner(
    ownerId: string,
    ownerType: WalletOwnerType,
  ): Promise<WalletTransaction[]> {
    return this.findAll({
      ownerId,
      ownerType,
    });
  }

  async findTransactionsPaginated(
    ownerId: string,
    ownerType: WalletOwnerType,
    query: WalletTransactionsQueryDto = {},
  ): Promise<PaginatedWalletTransactionsResult> {
    const {
      page = 1,
      limit = 10,
      type = "ALL",
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const filter: Record<string, unknown> = {
      ownerId,
      ownerType,
    };

    if (type !== "ALL") {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        {
          reference: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [docs, total] = await Promise.all([
      WalletTransactionModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),

      WalletTransactionModel
        .countDocuments(filter)
        .exec(),
    ]);

    const transactions = docs.map((doc) =>
      this.toInterface(doc),
    );

    const totals = await WalletTransactionModel.aggregate<TransactionTotalResult>([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$type",
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    let totalCredits = 0;
    let totalDebits = 0;

    for (const item of totals) {
      if (item._id === WALLET_TRANSACTION_TYPE.CREDIT) {
        totalCredits = item.total;
      }

      if (item._id === WALLET_TRANSACTION_TYPE.DEBIT) {
        totalDebits = item.total;
      }
    }

    return {
      transactions,

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },

      totalCredits,
      totalDebits,
    };
  }

  async getTransactionTotals(
    ownerId: string,
    ownerType: WalletOwnerType,
  ): Promise<{
    totalCredits: number;
    totalDebits: number;
  }> {
    const result =
      await WalletTransactionModel.aggregate<TransactionTotalResult>([
        {
          $match: {
            ownerId,
            ownerType,
          },
        },
        {
          $group: {
            _id: "$type",
            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

    let totalCredits = 0;
    let totalDebits = 0;

    for (const item of result) {
      if (item._id === WALLET_TRANSACTION_TYPE.CREDIT) {
        totalCredits = item.total;
      }

      if (item._id === WALLET_TRANSACTION_TYPE.DEBIT) {
        totalDebits = item.total;
      }
    }

    return {
      totalCredits,
      totalDebits,
    };
  }
}