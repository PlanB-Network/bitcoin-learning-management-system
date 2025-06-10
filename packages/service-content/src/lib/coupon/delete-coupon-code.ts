import { firstRow, rejectOnEmpty, sql } from '@blms/database';
import type { CouponCode } from '@blms/types';

import type { Dependencies } from '../dependencies.js';

export const createDeleteCouponCode = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return (code: string) => {
    console.log('Delete coupon code', code);

    return postgres
      .exec(sql<CouponCode[]>`
      UPDATE content.coupon_code
        SET deleted_at = NOW()
        WHERE code = ${code}
        RETURNING *;
    `)
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};
