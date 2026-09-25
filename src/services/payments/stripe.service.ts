import {
  CheckoutResult,
  CreateCheckoutParams,
  CreateStripePayoutParams,
  ParsedWebhookEvent,
  StripePayoutResult,
} from '@/modules/payment/interface/stripe.interface';
import { IPaymentService } from '@/modules/payment/interface/stripe-service.interface';
import Stripe from "stripe";

export class PaymentService implements IPaymentService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: params.currency,
            product_data: {
              name: params.planName,
              description: params.description,
            },
            unit_amount: Math.round(params.amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  constructWebhookEvent(payload: Buffer, signature: string): ParsedWebhookEvent {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    );
    return {
      type: event.type,
      data: event.data.object as unknown as Record<string, unknown>,
    };
  }

  /**
   * Creates a Stripe Payout from the platform's Stripe balance to the
   * platform's default bank account. Used when admin approves a trainer
   * payout request — the Stripe payout ID is recorded as proof of payment.
   *
   * Note: In production with Stripe Connect, use stripe.transfers.create()
   * to send funds directly to a trainer's connected Stripe account.
   */
  async createTrainerPayout(params: CreateStripePayoutParams): Promise<StripePayoutResult> {
    const payout = await this.stripe.payouts.create({
      amount: params.amountInSmallestUnit,
      currency: params.currency.toLowerCase(),
      description: params.description,
      metadata: params.metadata ?? {},
      statement_descriptor: params.statementDescriptor?.slice(0, 22),
    });

    return {
      stripePayoutId: payout.id,
      status: payout.status,
      amount: payout.amount,
      currency: payout.currency,
      arrivalDate: payout.arrival_date,
      method: payout.method,
    };
  }
}