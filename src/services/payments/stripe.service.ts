import { IStripeService } from "@/interfaces/payment/stripe-service.interface";
import Stripe from "stripe";

export class StripeService implements IStripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createCheckoutSession(
    params: Stripe.Checkout.SessionCreateParams,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create(params);
  }

  constructWebhookEvent(
    payload: Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
