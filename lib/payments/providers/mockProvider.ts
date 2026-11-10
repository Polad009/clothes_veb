import {
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
  WebhookResult,
  RefundResult,
} from "../types";

export class MockPaymentProvider implements PaymentProvider {
  name = "mock";

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const isLive = process.env.PAYMENT_MODE === "live";
    if (isLive) {
      throw new Error("Təhlükəsizlik xətası: 'mock' ödəniş provayderi canlı (live) rejimdə istifadə edilə bilməz!");
    }

    // 1. Business Rule: Reject Cash On Delivery if any item is a custom print design
    const hasCustomItems = request.items.some((i) => i.type === "custom");
    if (request.method === "cash_on_delivery" && hasCustomItems) {
      return {
        success: false,
        status: "failed",
        message: "Öz dizaynınızla hazırlanan məhsullar üçün qapıda ödəniş mövcud deyil. Zəhmət olmasa kart, Apple Pay və ya Google Pay ilə öncədən ödəniş edin.",
        isTest: true,
      };
    }

    const transactionId = `test_txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 2. Cash On Delivery
    if (request.method === "cash_on_delivery") {
      return {
        success: true,
        transactionId,
        status: "confirmed_cod",
        message: "Sifarişiniz qapıda nağd/kartla ödəniş seçimi ilə qeydə alındı.",
        isTest: true,
      };
    }

    // 3. Apple Pay & Google Pay (Simulated / Test Wallet authorized)
    if (request.method === "apple_pay" || request.method === "google_pay") {
      return {
        success: true,
        transactionId,
        status: "test_paid",
        message: `TEST REJİMİ: ${request.method === "apple_pay" ? "Apple Pay" : "Google Pay"} ilə ödəniş təsdiqləndi (Real pul çəkilmədi).`,
        isTest: true,
      };
    }

    // 4. Credit/Debit Card without integrated gateway
    return {
      success: false,
      status: "pending_payment",
      message: "Bank kartı ödəniş provayderi (Stripe/PashaBank/Payriff) hələ konfiqurasiya edilməyib. Zəhmət olmasa test rejimində Apple Pay, Google Pay və ya Çatdırılmada Ödəniş seçin.",
      isTest: true,
    };
  }

  async verifyWebhook(body: any, headers: Record<string, string>): Promise<WebhookResult> {
    // In mock provider, verify simple test event
    return {
      valid: true,
      orderId: body?.orderId,
      transactionId: body?.transactionId,
      status: body?.status || "test_paid",
      raw: body,
    };
  }

  async getStatus(transactionId: string): Promise<PaymentStatus> {
    return "test_paid";
  }

  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    return {
      success: true,
      refundId: `ref_mock_${Date.now()}`,
      amount,
      message: "Test ödənişi uğurla geri qaytarıldı.",
    };
  }
}

