import { api } from '@/lib/api';
import type { PaymentProvider } from '@/lib/constants';
import type { PaymentStatus } from '@/types/payment';

export interface InitPaymentPayload {
  subjectId: string;
  provider: Exclude<PaymentProvider, 'manual'>;
}

export interface PaymentInitResponse {
  orderId: string;
  provider: Exclude<PaymentProvider, 'manual'>;
  status: 'pending';
  amount: number;
  currency: string;
  checkoutUrl?: string;
  instructions?: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  status: PaymentStatus;
  paidAt?: string;
  failureReason?: string;
}

export const paymentsApi = {
  init: (p: InitPaymentPayload) => api.post<PaymentInitResponse>('/payments/init', p),
  status: (orderId: string) =>
    api.get<PaymentStatusResponse>(`/payments/${orderId}/status`)
};
