import { useMutation } from '@/hooks/useMutation';
import {
  paymentsApi,
  type InitPaymentPayload,
  type PaymentInitResponse,
  type PaymentStatusResponse
} from './api';

export function useInitPayment() {
  return useMutation<PaymentInitResponse, InitPaymentPayload>((p) => paymentsApi.init(p));
}

export function usePaymentStatus() {
  return useMutation<PaymentStatusResponse, string>((orderId) =>
    paymentsApi.status(orderId)
  );
}
