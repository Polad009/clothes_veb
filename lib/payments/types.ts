export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay' | 'cash_on_delivery';

export type OrderItemType = 'ready' | 'custom';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: OrderItemType; // 'ready' və ya 'custom'
  size?: string;
  color?: string;
  customDesignId?: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  items: OrderItem[];
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  message?: string;
}
