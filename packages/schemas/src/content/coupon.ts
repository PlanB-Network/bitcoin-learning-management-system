import { couponCode } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const couponCodeSchema = createSelectSchema(couponCode);

export const couponCodeWithOwnerSchema = couponCodeSchema.merge(
  z.object({
    owner: z.string().optional().nullable(),
  }),
);

export const couponTargetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});
