import { firstRow, sql } from '@blms/database';
import type { CouponCode } from '@blms/types';

import type { Dependencies } from '../dependencies.js';

const getCouponById = (id: string) => {
  return sql<CouponCode[]>`
    SELECT *
      FROM content.coupon_code
      WHERE
        id = ${id}
        AND uses < max_uses
        AND deleted_at IS NULL
        ;
  `;
};

export const createGetCouponById = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (id: string) => {
    try {
      const result = await postgres.exec(getCouponById(id)).then(firstRow);
      if (!result) {
        return null;
      }

      return result;
    } catch {
      throw new Error('Coupon not found');
    }
  };
};
