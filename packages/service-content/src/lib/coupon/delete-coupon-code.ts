import { firstRow, rejectOnEmpty, sql } from '@blms/database';
import type { CouponCode } from '@blms/types';

import type { Dependencies } from '../dependencies.js';
import { createCheckCoordinator } from '../professors/services/check-coordinator.js';

export const createDeleteCourseCouponCodeCoordinator = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async ({ code, userId }: { code: string; userId: string }) => {
    const isCourseCoordinator = await createCheckCoordinator({
      postgres,
    })({ userId, code });

    if (!isCourseCoordinator) {
      throw new Error(
        'Teacher is not the coordinator of the course associated with this coupon code.',
      );
    }

    console.log('Delete coupon code', code, 'by coordinator with uid', userId);

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
