import { firstRow, sql } from '@blms/database';
import type { CouponCode } from '@blms/types';

import type { Dependencies } from '../dependencies.js';

const getCouponCode = (code: string, itemId?: string) => {
  return sql<CouponCode[]>`
    SELECT *
      FROM content.coupon_code
      WHERE
        LOWER(code) = LOWER(${code})
        ${itemId ? sql`AND LOWER(item_id) = LOWER(${itemId})` : sql``}
        AND uses < max_uses
        AND deleted_at IS NULL
        ;
  `;
};

export const createGetCouponCode = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (code: string, itemId?: string) => {
    try {
      const result = await postgres
        .exec(getCouponCode(code, itemId))
        .then(firstRow);
      if (!result) {
        return null;
      }

      return result;
    } catch {
      throw new Error('Coupon not found');
    }
  };
};
