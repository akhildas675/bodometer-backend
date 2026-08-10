import { injectable } from "inversify";
import { ClientSession } from "mongoose";
import { UserWallet, WalletTransaction } from "../interface/domain/wallet.interface";
import { IUserWalletDocument, IWalletTransactionDocument, UserWalletModel, WalletTransactionModel } from "../model/wallet.model";

export interface IWalletRepository {
  findWalletByUserId(userId: string, session?: ClientSession): Promise<UserWallet | null>;
  createWallet(userId: string, initialBalance?: number, session?: ClientSession): Promise<UserWallet>;
  updateBalance(userId: string, newBalance: number, session?: ClientSession): Promise<UserWallet | null>;
  createTransaction(txData: Partial<WalletTransaction>, session?: ClientSession): Promise<WalletTransaction>;
  findTransactionsByUserId(userId: string): Promise<WalletTransaction[]>;
}

@injectable()
export class WalletRepository implements IWalletRepository {
  private mapWalletDoc(doc: IUserWalletDocument): UserWallet {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      balance: doc.balance,
      currency: doc.currency,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private mapTxDoc(doc: IWalletTransactionDocument): WalletTransaction {
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
    const doc = await UserWalletModel.findOne({ userId }, null, { session });
    return doc ? this.mapWalletDoc(doc) : null;
  }

  async createWallet(userId: string, initialBalance: number = 0, session?: ClientSession): Promise<UserWallet> {
    const docs = await UserWalletModel.create(
      [{ userId, balance: initialBalance, currency: "INR" }],
      { session },
    );
    return this.mapWalletDoc(docs[0]);
  }

  async updateBalance(userId: string, newBalance: number, session?: ClientSession): Promise<UserWallet | null> {
    const doc = await UserWalletModel.findOneAndUpdate(
      { userId },
      { $set: { balance: newBalance } },
      { new: true, runValidators: true, session },
    ).exec();
    return doc ? this.mapWalletDoc(doc) : null;
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
    return this.mapTxDoc(docs[0]);
  }

  async findTransactionsByUserId(userId: string): Promise<WalletTransaction[]> {
    const docs = await WalletTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((d) => this.mapTxDoc(d));
  }
}
