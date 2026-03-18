import Stripe from "stripe";

export interface IStripeService {
    createCheckoutSession(
        params: Stripe.Checkout.SessionCreateParams,
    ): Promise<Stripe.Checkout.Session>;
    constructWebhookEvent(
        payload: Buffer,
        signature: string,
        secret: string,
    ): Stripe.Event;
}