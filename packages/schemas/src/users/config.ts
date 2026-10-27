import { z } from 'zod';

export const envConfigEndpointResultSchema = z.object({
  paymentsDisabled: z.boolean(),
  stripePublicKey: z.string(),
});
