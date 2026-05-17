import { CheckoutResult, CreateCheckoutParams, ParsedWebhookEvent } from "@/interfaces/domain.interface/payment.interface/stripe.interface";
import { IPaymentService } from "@/interfaces/service-interface/payment/stripe-service.interface";
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
            unit_amount: params.amount,
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
}