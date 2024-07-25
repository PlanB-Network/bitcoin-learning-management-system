import { z } from 'zod';

import { createGetCouponCode } from '@blms/content';
import { couponCodeSchema } from '@blms/schemas';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getCouponCodeProcedure = publicProcedure
  .input(
    z.object({
      code: z.string(),
      itemId: z.string(),
    }),
  )
  .output(couponCodeSchema.nullable())
  .query(({ ctx, input }) =>
    createGetCouponCode(ctx.dependencies)(input.code, input.itemId),
  );

export const couponRouter = createTRPCRouter({
  getCouponCode: getCouponCodeProcedure,
});
