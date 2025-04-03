import { firstRow, sql } from '@blms/database';
import type { CouponCode } from '@blms/types';

import type { Dependencies } from '../dependencies.js';

const getCouponCode = (code: string) => {
  return sql<CouponCode[]>`
    SELECT *
      FROM content.coupon_code
      WHERE
        LOWER(code) = LOWER(${code})
        AND uses < max_uses
        AND deleted_at IS NULL
        ;
  `;
};

export const createGetCouponCode = ({ postgres }: Dependencies) => {
  return async (code: string) => {
    try {
      const result = await postgres.exec(getCouponCode(code)).then(firstRow);
      if (!result) {
        return null;
      }

      return result;
    } catch {
      throw new Error('Coupon not found');
    }
  };
};
