import crypto from 'crypto';

export type LatpeedEventType =
  | 'subscription.created'
  | 'subscription.renewed'
  | 'subscription.cancelled'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.refunded';

export interface LatpeedWebhookEvent {
  type: LatpeedEventType;
  createdAt: string;
  data: {
    subscriptionId?: string;
    paymentId?: string;
    customerEmail: string;
    customerName?: string;
    status?: string;
    amount?: number;
    currency?: string;
    nextBillingDate?: string;
    metadata?: Record<string, any>;
  };
}

interface VerifyOptions {
  rawBody: string;
  signature: string;
  eventNameHeader: string;
  timestampHeader: string;
}

const LATPEED_SECRET = process.env.LATPEED_WEBHOOK_SECRET || '';

export function verifyLatpeedWebhook(options: VerifyOptions): LatpeedWebhookEvent {
  if (!LATPEED_SECRET) {
    throw new Error('LATPEED_WEBHOOK_SECRET_NOT_SET');
  }

  const { rawBody, signature, eventNameHeader, timestampHeader } = options;

  if (!signature || !timestampHeader || !eventNameHeader) {
    throw new Error('WEBHOOK_HEADERS_MISSING');
  }

  const hmac = crypto.createHmac('sha256', LATPEED_SECRET);
  hmac.update(`${timestampHeader}.${rawBody}`);
  const expected = hmac.digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error('WEBHOOK_SIGNATURE_INVALID');
  }

  const payload = JSON.parse(rawBody);

  const event: LatpeedWebhookEvent = {
    type: (eventNameHeader as LatpeedEventType) || payload.event_type,
    createdAt: payload.created_at || new Date().toISOString(),
    data: {
      subscriptionId: payload.subscription_id || payload.data?.subscription_id,
      paymentId: payload.payment_id || payload.data?.payment_id,
      customerEmail: payload.customer_email || payload.data?.customer?.email,
      customerName: payload.customer_name || payload.data?.customer?.name,
      status: payload.status || payload.data?.status,
      amount: payload.amount || payload.data?.amount,
      currency: payload.currency || payload.data?.currency,
      nextBillingDate: payload.next_billing_date || payload.data?.next_billing_date,
      metadata: payload.metadata || payload.data?.metadata,
    },
  };

  if (!event.data.customerEmail) {
    throw new Error('WEBHOOK_PAYLOAD_MISSING_EMAIL');
  }

  return event;
}

export interface CreateCheckoutParams {
  planId: string;
  price: number;
  currency?: string;
  customer: {
    email: string;
    name: string;
    id?: string;
  };
  metadata?: Record<string, any>;
  successUrl: string;
  cancelUrl: string;
}

export interface LatpeedCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export async function createLatpeedCheckout(params: CreateCheckoutParams): Promise<LatpeedCheckoutResponse> {
  const apiKey = process.env.LATPEED_API_KEY;
  const merchantId = process.env.LATPEED_MERCHANT_ID;
  const baseUrl = process.env.LATPEED_API_BASE_URL || 'https://api.latpeed.com';

  if (!apiKey || !merchantId) {
    throw new Error('LATPEED_API_KEY_OR_MERCHANT_ID_MISSING');
  }

  const response = await fetch(`${baseUrl}/v1/checkout/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Latpeed-Api-Key': apiKey,
      'X-Latpeed-Merchant-Id': merchantId,
    },
    body: JSON.stringify({
      plan_id: params.planId,
      amount: params.price,
      currency: params.currency || 'KRW',
      customer: params.customer,
      metadata: params.metadata,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LATPEED_CHECKOUT_FAILED_${response.status}_${text}`);
  }

  const data = await response.json();
  return {
    checkoutUrl: data.checkout_url || data.url,
    sessionId: data.session_id || data.id,
  };
}
