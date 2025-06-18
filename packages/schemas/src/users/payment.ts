import { usersGeneralPayment } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const generalPaymentSchema = createSelectSchema(usersGeneralPayment);

export const generalPaymentLightSchema = generalPaymentSchema.pick({
  item: true,
  paymentStatus: true,
  amount: true,
  paymentId: true,
  invoiceUrl: true,
});

export const checkoutDataSchema = z.object({
  id: z.string(),
  pr: z.string(),
  onChainAddr: z.string().optional(),
  amount: z.number(),
  checkoutUrl: z.string(),
  clientSecret: z.string().optional(),
});

export const stripeSessionSchema = z.object({
  status: z.string(),
});
