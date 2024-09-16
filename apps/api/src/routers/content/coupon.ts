import { z } from 'zod';

import { couponCodeSchema } from '@blms/schemas';
import { createGetCouponCode } from '@blms/service-content';
import type { CouponCode } from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getCouponCodeProcedure = publicProcedure
  .input(
    z.object({
      code: z.string(),
      itemId: z.string(),
    }),
  )
  .output<Parser<CouponCode | null>>(couponCodeSchema.nullable())
  .query(({ ctx, input }) =>
    createGetCouponCode(ctx.dependencies)(input.code, input.itemId),
  );

export const couponRouter = createTRPCRouter({
  getCouponCode: getCouponCodeProcedure,
});
