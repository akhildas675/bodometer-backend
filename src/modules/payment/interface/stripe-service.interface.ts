import { CheckoutResult, CreateCheckoutParams, ParsedWebhookEvent } from '@/modules/payment/interface/stripe.interface';


export interface IPaymentService {
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult>;
  constructWebhookEvent(payload: Buffer, signature: string): ParsedWebhookEvent;
}