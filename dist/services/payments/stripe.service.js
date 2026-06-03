"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
class PaymentService {
    stripe;
    webhookSecret;
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    }
    async createCheckoutSession(params) {
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
    constructWebhookEvent(payload, signature) {
        const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
        return {
            type: event.type,
            data: event.data.object,
        };
    }
}
exports.PaymentService = PaymentService;
