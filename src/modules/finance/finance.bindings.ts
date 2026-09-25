import { Container } from "inversify";
import { FINANCE_TYPES } from "./finance.types";
import { IFinancialTransactionRepository } from "./interface/finance-repository.interface";
import { FinancialTransactionRepository } from "./repositories/financial-transaction.repository";
import { IPayoutRequestRepository } from "./interface/payout-repository.interface";
import { PayoutRequestRepository } from "./repositories/payout-request.repository";
import { IFinanceService } from "./interface/finance-service.interface";
import { FinanceService } from "./services/finance.service";
import { IPayoutService } from "./interface/payout-service.interface";
import { PayoutService } from "./services/payout.service";
import { FinanceController } from "./controller/finance.controller";
import { PayoutController } from "./controller/payout.controller";
import { IPaymentService } from "@/modules/payment/interface/stripe-service.interface";
import { PaymentService } from "@/services/payments/stripe.service";

export const loadFinanceBindings = (container: Container): void => {
  container
    .bind<IFinancialTransactionRepository>(
      FINANCE_TYPES.FinancialTransactionRepository,
    )
    .to(FinancialTransactionRepository);

  container
    .bind<IPayoutRequestRepository>(FINANCE_TYPES.PayoutRequestRepository)
    .to(PayoutRequestRepository);

  container
    .bind<IFinanceService>(FINANCE_TYPES.FinanceService)
    .to(FinanceService);

  container
    .bind<IPayoutService>(FINANCE_TYPES.PayoutService)
    .to(PayoutService);

  container
    .bind<FinanceController>(FINANCE_TYPES.FinanceController)
    .to(FinanceController);

  container
    .bind<PayoutController>(FINANCE_TYPES.PayoutController)
    .to(PayoutController);

  // Stripe payment service used by PayoutService for automated disbursements
  container
    .bind<IPaymentService>(FINANCE_TYPES.PaymentService)
    .to(PaymentService);
};
