import { z } from 'zod';

export const checkoutDataSchema = z.object({
  id: z.string(),
  pr: z.string(),
  onChainAddr: z.string(),
  amount: z.number(),
  checkoutUrl: z.string(),
});
