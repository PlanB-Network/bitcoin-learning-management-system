import { UserPermission } from '@blms/constants';
import {
  couponCodeSchema,
  couponCodeWithOwnerSchema,
  couponTargetSchema,
} from '@blms/schemas';
import {
  createCreateCouponCode,
  createDeleteCouponCode,
  createGetCouponCode,
  createListCouponCodes,
  createListEventsAndCourses,
} from '@blms/service-content';
import type { CouponCode, CouponCodeWithOwner } from '@blms/types';
import { z } from 'zod';
import { checkPermissions } from '#src/middlewares/auth.js';
import { adminProcedure } from '#src/procedures/protected.js';
import { publicProcedure } from '#src/procedures/public.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

// Public
const getCouponCode = publicProcedure
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

// Admin
const listEventsAndCourses = adminProcedure
  .use(checkPermissions(UserPermission.Coupons))
  .output(z.array(couponTargetSchema))
  .query(({ ctx }) => createListEventsAndCourses(ctx.dependencies)());

// Admin
const listCouponCodes = adminProcedure
  .use(checkPermissions(UserPermission.Coupons))
  .input(
    z.object({
      limit: z.number().default(10),
      page: z.number().default(1),
      singleUse: z.boolean().nullable().default(null),
      sortBy: z.string().default('createdAt'),
      sortDirection: z.enum(['asc', 'desc']).default('desc'),
    }),
  )
  .output<Parser<CouponCodeWithOwner[]>>(z.array(couponCodeWithOwnerSchema))
  .query(({ ctx, input }) => createListCouponCodes(ctx.dependencies)(input));

// Admin
const createCouponCode = adminProcedure
  .use(checkPermissions(UserPermission.Coupons))
  .input(
    z.object({
      code: z.string().nullable(),
      itemId: z.string(),
      maxUses: z.number().default(1),
      numberOfCodes: z.number().default(1),
      reductionPercentage: z.number().min(1).max(100),
      singleUse: z.boolean(),
    }),
  )
  .output<Parser<CouponCode[]>>(couponCodeSchema.array())
  .mutation(({ ctx, input }) =>
    createCreateCouponCode(ctx.dependencies)(input, ctx.user.uid),
  );

// Admin
const deleteCouponCode = adminProcedure
  .use(checkPermissions(UserPermission.Coupons))
  .input(z.string())
  .output<Parser<CouponCode>>(couponCodeSchema)
  .mutation(({ ctx, input }) =>
    createDeleteCouponCode(ctx.dependencies)(input),
  );

// Router
export const couponRouter = createTRPCRouter({
  createCouponCode,
  deleteCouponCode,
  // Public
  getCouponCode,
  // Admin
  listCouponCodes,
  listEventsAndCourses,
});
