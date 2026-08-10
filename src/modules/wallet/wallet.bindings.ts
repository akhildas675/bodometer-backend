import { Container } from "inversify";
import { WALLET_TYPES } from "./wallet.types";
import { IWalletRepository, WalletRepository } from "./repositories/wallet.repository";
import { IWalletService, WalletService } from "./services/wallet.service";
import { WalletController } from "./controller/wallet.controller";

export const loadWalletBindings = (container: Container): void => {
  container.bind<IWalletRepository>(WALLET_TYPES.WalletRepository).to(WalletRepository);
  container.bind<IWalletService>(WALLET_TYPES.WalletService).to(WalletService);
  container.bind<WalletController>(WALLET_TYPES.WalletController).to(WalletController);
};
