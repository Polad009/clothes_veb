import {
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
  WebhookResult,
  RefundResult,
} from "../types";

/**
 * Production Gateway Template (Stripe / Payriff / Pasha Bank / Kapital Bank)
 * To connect your live provider:
 * 1. Fill in API keys in .env.local
 * 2. Complete createPayment to return the provider's hosted checkout URL or payment intent
 * 3. Complete verifyWebhook with provider's cryptographic signature verification
 */
export class RealGatewayTemplateProvider implements PaymentProvider {
  name = "real_gateway_template";

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const isLive = process.env.PAYMENT_MODE === "live";
    const apiKey = process.env.PAYMENT_API_KEY;

    if (!apiKey && isLive) {
      return {
        success: false,
        status: "failed",
        message: "Canlı ödəniş provayderinin API açarları (PAYMENT_API_KEY) təyin edilməyib.",
      };
    }

    // Example hosted checkout redirection or direct session initialization
    // const session = await bankClient.createCheckout({ amount: request.amount, ... });

    return {
      success: true,
      transactionId: `real_txn_${Date.now()}`,
      status: "pending_payment",
      paymentUrl: `https://checkout.provider.com/pay?order=${request.orderId}`,
      message: "Ödəniş şlüzünə yönləndirilir...",
      isTest: !isLive,
    };
  }

  async verifyWebhook(body: any, headers: Record<string, string>): Promise<WebhookResult> {
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    const signature = headers["stripe-signature"] || headers["x-webhook-signature"] || "";

    if (!webhookSecret || !signature) {
      console.warn("[PaymentWebhook] Webhook signature or secret missing");
      return { valid: false };
    }

    // Verify cryptographic signature here (e.g. crypto.createHmac or provider SDK)
    return {
      valid: true,
      orderId: body?.order_id || body?.data?.object?.metadata?.orderId,
      transactionId: body?.id || body?.data?.object?.id,
      status: body?.status === "succeeded" ? "paid" : "failed",
      raw: body,
    };
  }

  async getStatus(transactionId: string): Promise<PaymentStatus> {
    return "paid";
  }

  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    return {
      success: true,
      refundId: `ref_${Date.now()}`,
      amount,
      message: "Ödəniş geri qaytarıldı.",
    };
  }
}

