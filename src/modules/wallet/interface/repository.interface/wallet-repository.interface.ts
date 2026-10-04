import { WalletOwnerType } from "../../constants/wallet.constants";
import { Wallet } from "../domain/wallet.interface";

export interface IWalletRepository {
  findWallet(
    ownerId: string,
    ownerType: WalletOwnerType,
  ): Promise<Wallet | null>;

  createWallet(
    ownerId: string,
    ownerType: WalletOwnerType,
    initialBalance?: number,
  ): Promise<Wallet>;

  updateBalance(
    ownerId: string,
    ownerType: WalletOwnerType,
    newBalance: number,
  ): Promise<Wallet | null>;

  incrementBalance(
    ownerId: string,
    ownerType: WalletOwnerType,
    amount: number,
  ): Promise<Wallet | null>;

  decrementBalance(
    ownerId: string,
    ownerType: WalletOwnerType,
    amount: number,
  ): Promise<Wallet | null>;
}