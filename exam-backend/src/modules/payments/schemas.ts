import { z } from 'zod';

export const initPaymentSchema = z.object({
  subjectId: z.string().min(1, 'subjectId is required'),
  provider: z.enum(['telebirr', 'cbe_birr', 'chapa'], {
    errorMap: () => ({
      message: 'Provider must be telebirr, cbe_birr, or chapa'
    })
  })
});
export type InitPaymentInput = z.infer<typeof initPaymentSchema>;

export const orderIdParamSchema = z.object({
  orderId: z.string().min(1)
});

export const webhookProviderParamSchema = z.object({
  provider: z.enum(['telebirr', 'cbe_birr', 'chapa'])
});
