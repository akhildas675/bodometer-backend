export interface CreateCheckoutParams {
  planName: string;
  description: string;
  amount: number;      
  currency: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  sessionId: string;
  url: string;
}

export interface ParsedWebhookEvent {
  type: string;
  data: Record<string, unknown>;
}