import { sql } from '@sovereign-university/database';
import type { CouponCode } from '@sovereign-university/types';

export const getCouponCode = (code: string, itemId: string) => {
  return sql<CouponCode[]>`
    SELECT code, item_id, reduction_percentage, is_unique, is_used, uid, time_used
    FROM content.coupon_code
    WHERE LOWER(code) = LOWER(${code}) AND item_id = ${itemId} AND is_used = false;
  `;
};
