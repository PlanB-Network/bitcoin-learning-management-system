import { firstRow, sql } from '@blms/database';
import type { CouponCode } from '@blms/types';

import type { Dependencies } from '../dependencies.js';

const getCouponById = (id: string, rejectIfUsed: boolean) => {
  return sql<CouponCode[]>`
    SELECT *
      FROM content.coupon_code
      WHERE
        id = ${id}
        ${rejectIfUsed ? sql`AND uses < max_uses` : sql``}
        AND deleted_at IS NULL
        ;
  `;
};

export const createGetCouponById = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (id: string, options?: { rejectIfUsed?: boolean }) => {
    const rejectIfUsed = options?.rejectIfUsed ?? true;

    try {
      const result = await postgres
        .exec(getCouponById(id, rejectIfUsed))
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
