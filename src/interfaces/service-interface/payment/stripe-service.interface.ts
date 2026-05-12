import { CheckoutResult, CreateCheckoutParams, ParsedWebhookEvent } from "@/interfaces/domain.interface/payment.interface/stripe.interface";


export interface IPaymentService {
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult>;
  constructWebhookEvent(payload: Buffer, signature: string): ParsedWebhookEvent;
}