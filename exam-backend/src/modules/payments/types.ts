import type { PaymentProvider, PaymentStatus } from '@prisma/client';

export type FlowProvider = Extract<PaymentProvider, 'telebirr' | 'cbe_birr' | 'chapa'>;

export interface PaymentInitResponseDTO {
  orderId: string;
  provider: FlowProvider;
  status: 'pending';
  amount: number;
  currency: string;
  checkoutUrl?: string;
  instructions?: string;
}

export interface PaymentStatusResponseDTO {
  orderId: string;
  status: PaymentStatus;
  paidAt?: string;
  failureReason?: string;
}

export interface WebhookPayload {
  providerRef: string;
  status: 'succeeded' | 'failed';
  paidAt?: string;
  failureReason?: string;
}
