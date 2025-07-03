import { usersGeneralPayment } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const generalPaymentSchema = createSelectSchema(usersGeneralPayment);

export const generalPaymentLightSchema = generalPaymentSchema.pick({
  amount: true,
  invoiceUrl: true,
  item: true,
  paymentId: true,
  paymentStatus: true,
});

export const checkoutDataSchema = z.object({
  amount: z.number(),
  checkoutUrl: z.string(),
  clientSecret: z.string().optional(),
  id: z.string(),
  onChainAddr: z.string().optional(),
  pr: z.string(),
});

export const stripeSessionSchema = z.object({
  status: z.string(),
});
