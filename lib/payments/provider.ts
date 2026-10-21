import { PaymentMethod, PaymentRequest, PaymentResponse, OrderItem } from "./types";

export interface PaymentProvider {
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<boolean>;
}

/**
 * Core Business Rule Validator:
 * Səbətdə bir dənə belə custom (fərdi çap) varsa, qapıda ödəniş (cash_on_delivery) qadağandır!
 */
export function validatePaymentEligibility(items: OrderItem[], method: PaymentMethod): { valid: boolean; reason?: string } {
  const hasCustomItems = items.some((item) => item.type === "custom");
  
  if (hasCustomItems && method === "cash_on_delivery") {
    return {
      valid: false,
      reason: "Fərdi çap (custom) məhsulları üçün qapıda ödəniş mövcud deyil. Zəhmət olmasa kart, Apple Pay və ya Google Pay ilə öncədən ödəniş edin.",
    };
  }

  return { valid: true };
}

/**
 * Mock Pluggable Local Payment Provider
 * Local Azerbaijani banks/gateways (Kapital, Pasha, MilliÖN, E-Manat, etc.) will plug into this interface.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // 1. Validate business rule
    const validation = validatePaymentEligibility(request.items, request.method);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.reason,
      };
    }

    // 2. Process according to method
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (request.method === "cash_on_delivery") {
      return {
        success: true,
        transactionId,
        message: "Sifarişiniz qapıda ödəniş seçimi ilə qeydə alındı.",
      };
    }

    // For Apple Pay / Google Pay / Card
    return {
      success: true,
      transactionId,
      paymentUrl: `/checkout/success?txn=${transactionId}`,
      message: "Ödəniş uğurla qəbul edildi.",
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    return Boolean(transactionId);
  }
}

export const defaultPaymentProvider = new MockPaymentProvider();
