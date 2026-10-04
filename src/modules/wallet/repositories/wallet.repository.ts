import { injectable } from "inversify";

import { BaseRepository } from "@/modules/base/repository/base.repository";

import {
  Wallet,
} from "../interface/domain/wallet.interface";

import {
  IWalletRepository,
} from "../interface/repository.interface/wallet-repository.interface";

import {
  IWalletDocument,
  WalletModel,
} from "../model/wallet.model";

import {
  WalletOwnerType,
} from "../constants/wallet.constants";

@injectable()
export class WalletRepository
  extends BaseRepository<
    Wallet,
    IWalletDocument
  >
  implements IWalletRepository
{
  constructor() {
    super(WalletModel);
  }

  protected toInterface(
    doc: IWalletDocument,
  ): Wallet {
    return {
      id: doc._id.toString(),
      ownerId: doc.ownerId,
      ownerType: doc.ownerType,
      balance: doc.balance,
      currency: doc.currency,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findWallet(
    ownerId: string,
    ownerType: WalletOwnerType,
  ): Promise<Wallet | null> {
    return this.findOne({
      ownerId,
      ownerType,
    });
  }

  async createWallet(
    ownerId: string,
    ownerType: WalletOwnerType,
    initialBalance = 0,
  ): Promise<Wallet> {
    return this.create({
      ownerId,
      ownerType,
      balance: initialBalance,
      currency: "INR",
    });
  }

  async updateBalance(
    ownerId: string,
    ownerType: WalletOwnerType,
    newBalance: number,
  ): Promise<Wallet | null> {
    const wallet = await this.findWallet(
      ownerId,
      ownerType,
    );

    if (!wallet) {
      return null;
    }

    return this.updateById(
      wallet.id,
      {
        $set: {
          balance: newBalance,
        },
      },
    );
  }

  async incrementBalance(
    ownerId: string,
    ownerType: WalletOwnerType,
    amount: number,
  ): Promise<Wallet | null> {
    const wallet = await this.findWallet(
      ownerId,
      ownerType,
    );

    if (!wallet) {
      return null;
    }

    return this.updateById(
      wallet.id,
      {
        $inc: {
          balance: amount,
        },
      },
    );
  }

  async decrementBalance(
    ownerId: string,
    ownerType: WalletOwnerType,
    amount: number,
  ): Promise<Wallet | null> {
    const wallet = await this.findWallet(
      ownerId,
      ownerType,
    );

    if (!wallet) {
      return null;
    }

    return this.updateById(
      wallet.id,
      {
        $inc: {
          balance: -amount,
        },
      },
    );
  }
}