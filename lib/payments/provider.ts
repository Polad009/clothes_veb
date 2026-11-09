import { PaymentMethod, PaymentRequest, PaymentResponse, OrderItem } from "./types";

export interface PaymentProvider {
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<boolean>;
}

export interface PaymentCustomerLocation {
  country?: string;
  countryCode?: string;
  [key: string]: any;
}

export interface PaymentEligibilityResult {
  valid: boolean;
  eligible: boolean;
  reason?: string;
}

/**
 * Core Business Rule Validator:
 * 1. Səbətdə bir dənə belə custom (fərdi çap) varsa, qapıda ödəniş (cash_on_delivery) qadağandır!
 * 2. Nağd ödəniş (COD) yalnız Azərbaycan daxili sifarişlər üçün keçərlidir. Beynəlxalq sifarişlər üçün qadağandır!
 */
export function validatePaymentEligibility(
  itemsOrRequest:
    | OrderItem[]
    | {
        items: OrderItem[];
        method?: PaymentMethod;
        paymentMethod?: PaymentMethod;
        customer?: PaymentCustomerLocation | string;
      },
  methodParam?: PaymentMethod,
  customerParam?: PaymentCustomerLocation | string
): PaymentEligibilityResult {
  let items: OrderItem[];
  let method: PaymentMethod;
  let customer: PaymentCustomerLocation | string | undefined;

  if (Array.isArray(itemsOrRequest)) {
    items = itemsOrRequest;
    method = methodParam!;
    customer = customerParam;
  } else if (itemsOrRequest && typeof itemsOrRequest === 'object') {
    items = itemsOrRequest.items || [];
    method = (itemsOrRequest.method || itemsOrRequest.paymentMethod)!;
    customer = itemsOrRequest.customer;
  } else {
    items = [];
    method = methodParam!;
    customer = customerParam;
  }

  // Check Cash on Delivery restrictions (Item 21: Total COD Removal)
  // Cash on delivery is completely disabled for ALL countries (including Azerbaijan).
  // All orders must be paid securely online.
  if (method === "cash_on_delivery") {
    return {
      valid: false,
      eligible: false,
      reason: "Nağd ödəniş (COD) ləğv edilmişdir. Bütün sifarişlər təhlükəsiz onlayn ödənişlə (Bank kartı, Apple Pay, Google Pay) qəbul olunur.",
    };
  }

  return { valid: true, eligible: true };
}

/**
 * Mock Pluggable Local Payment Provider
 * Local Azerbaijani banks/gateways (Kapital, Pasha, MilliÖN, E-Manat, etc.) will plug into this interface.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // 1. Validate business rule
    const validation = validatePaymentEligibility(request.items, request.method, request.customer);
    if (!validation.valid || !validation.eligible) {
      return {
        success: false,
        status: "failed",
        message: validation.reason,
      };
    }

    // 2. Process according to method
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (request.method === "cash_on_delivery") {
      return {
        success: false,
        status: "failed",
        message: "Nağd ödəniş (COD) ləğv edilmişdir. Bütün sifarişlər təhlükəsiz onlayn ödənişlə qəbul olunur.",
      };
    }

    // For Apple Pay / Google Pay / Card
    return {
      success: true,
      status: "test_paid",
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
