import {
  CheckoutResult,
  CreateCheckoutParams,
  CreateStripePayoutParams,
  ParsedWebhookEvent,
  StripePayoutResult,
} from '@/modules/payment/interface/stripe.interface';


export interface IPaymentService {
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult>;
  constructWebhookEvent(payload: Buffer, signature: string): ParsedWebhookEvent;
  createTrainerPayout(params: CreateStripePayoutParams): Promise<StripePayoutResult>;
}