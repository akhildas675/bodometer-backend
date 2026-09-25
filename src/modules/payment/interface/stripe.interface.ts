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

export interface StripePayoutResult {
  stripePayoutId: string;
  status: string;
  amount: number;
  currency: string;
  arrivalDate?: number;
  method?: string;
}

export interface CreateStripePayoutParams {
  /** Amount in the smallest currency unit (e.g., paise for INR) */
  amountInSmallestUnit: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
  statementDescriptor?: string;
}