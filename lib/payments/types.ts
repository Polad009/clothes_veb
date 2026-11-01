export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay' | 'cash_on_delivery';

export type PaymentStatus = 
  | 'pending_payment'
  | 'test_paid'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'confirmed_cod';

export type OrderItemType = 'ready' | 'custom';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: OrderItemType;
  size?: string;
  color?: string;
  customDesignId?: string;
}

export interface PaymentCustomer {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  country?: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  items: OrderItem[];
  customer: PaymentCustomer;
  isTest?: boolean;
  promoCode?: string | null;
  shippingCost?: number;
  discountAmount?: number;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  status: PaymentStatus;
  message?: string;
  isTest?: boolean;
}

export interface WebhookResult {
  valid: boolean;
  orderId?: string;
  transactionId?: string;
  status?: PaymentStatus;
  raw?: any;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  message?: string;
}

export interface PaymentProvider {
  name: string;
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyWebhook(body: any, headers: Record<string, string>): Promise<WebhookResult>;
  getStatus(transactionId: string): Promise<PaymentStatus>;
  refund(transactionId: string, amount?: number): Promise<RefundResult>;
}
