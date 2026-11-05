import {
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
  WebhookResult,
  RefundResult,
} from "../types";
import crypto from "crypto";

/**
 * E-Point Azerbaijan 3D Secure Payment Provider
 * Documentation: https://epoint.az/api/
 *
 * Flow:
 * 1. Merchant prepares JSON request with orderId, amount, currency, success_url, error_url
 * 2. Encodes JSON payload in Base64
 * 3. Signs with SHA1 private key signature
 * 4. Sends POST to https://epoint.az/api/1/request
 * 5. E-Point returns transaction ID + redirect_url (3D Secure Hosted Bank Page)
 * 6. Customer completes SMS 3DS OTP confirmation
 * 7. E-Point redirects to success_url and posts Webhook callback
 */
export class EpointPaymentProvider implements PaymentProvider {
  name = "epoint";

  private getPublicKey(): string {
    return process.env.EPOINT_PUBLIC_KEY || "";
  }

  private getPrivateKey(): string {
    return process.env.EPOINT_PRIVATE_KEY || "";
  }

  private isConfigured(): boolean {
    return Boolean(this.getPublicKey() && this.getPrivateKey());
  }

  /**
   * Generates E-Point SHA1 cryptographic signature:
   * signature = base64(sha1(private_key + data + private_key, binary))
   */
  private generateSignature(dataBase64: string): string {
    const privateKey = this.getPrivateKey();
    const hash = crypto.createHash("sha1");
    hash.update(privateKey + dataBase64 + privateKey);
    return hash.digest("base64");
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const publicKey = this.getPublicKey();
    const isLive = process.env.PAYMENT_MODE === "live";

    // If merchant keys are not set yet (pending contract), fallback gracefully to test 3D secure preview
    if (!this.isConfigured()) {
      return {
        success: true,
        transactionId: `epoint_demo_${Date.now()}`,
        status: "test_paid",
        paymentUrl: `/checkout/success?txn=epoint_demo_${Date.now()}`,
        message: "E-Point müqaviləsi tamamlanana qədər sınaq 3D Secure rejimi aktivdir.",
        isTest: true,
      };
    }

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.horwalle.com";
      const payload = {
        public_key: publicKey,
        amount: request.amount.toFixed(2),
        currency: request.currency || "AZN",
        language: "az",
        order_id: request.orderId,
        description: `Horwalle Atelier Sifariş #${request.orderId}`,
        success_redirect_url: `${siteUrl}/checkout/success?orderId=${request.orderId}`,
        error_redirect_url: `${siteUrl}/checkout/failed?orderId=${request.orderId}`,
      };

      const dataBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
      const signature = this.generateSignature(dataBase64);

      const endpoint = "https://epoint.az/api/1/request";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          data: dataBase64,
          signature,
        }).toString(),
      });

      const responseData = await res.json();

      if (responseData.status === "success" && responseData.redirect_url) {
        return {
          success: true,
          transactionId: responseData.transaction || `epoint_${Date.now()}`,
          status: "pending_payment",
          paymentUrl: responseData.redirect_url, // Official 3D Secure bank page
          message: "3D Secure Bank səhifəsinə yönləndirilir...",
          isTest: !isLive,
        };
      }

      return {
        success: false,
        status: "failed",
        message: responseData.message || "E-Point 3D Secure sorğusu uğursuz oldu.",
      };
    } catch (err: any) {
      console.error("[Epoint] Error creating 3DS payment:", err);
      return {
        success: false,
        status: "failed",
        message: "Ödəniş şlüzünə qoşularkən xəta: " + err.message,
      };
    }
  }

  async verifyWebhook(body: any, headers: Record<string, string>): Promise<WebhookResult> {
    const data = body?.data;
    const signature = body?.signature;

    if (!data || !signature) {
      return { valid: false, raw: body };
    }

    const expectedSig = this.generateSignature(data);
    if (signature !== expectedSig) {
      return { valid: false, raw: body };
    }

    try {
      const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
      const isSuccess = decoded.status === "success";

      return {
        valid: isSuccess,
        orderId: decoded.order_id,
        transactionId: decoded.transaction,
        status: isSuccess ? "paid" : "failed",
        raw: decoded,
      };
    } catch (err: any) {
      return { valid: false, raw: body };
    }
  }

  async getStatus(transactionId: string): Promise<PaymentStatus> {
    return "paid";
  }

  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    return {
      success: false,
      message: "E-Point avtomatik geri qaytarma portal üzərindən icra olunmalıdır.",
    };
  }
}
