import { firstRow, rejectOnEmpty, sql } from '@blms/database';
import type { CouponCode } from '@blms/types';

import type { Dependencies } from '../dependencies.js';
import { createCheckCoordinator } from '../professors/services/check-coordinator.js';

export const createDeleteCourseCouponCodeCoordinator = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async ({
    code,
    itemId,
    userId,
  }: {
    code: string;
    itemId: string;
    userId: string;
  }) => {
    const isCourseCoordinator = await createCheckCoordinator({
      postgres,
    })({ userId, code });

    if (!isCourseCoordinator) {
      throw new Error(
        'Teacher is not the coordinator of the course associated with this coupon code.',
      );
    }

    console.log('Delete coupon code', code, 'by coordinator with uid', userId);

    return deleteCoupon(postgres, code, itemId);
  };
};

export const createDeleteCouponCode = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (code: string, itemId: string) => {
    console.log('Delete coupon code', code, itemId);

    return deleteCoupon(postgres, code, itemId);
  };
};

const deleteCoupon = async (
  postgres: Dependencies['postgres'],
  code: string,
  itemId: string,
) => {
  const deleted = await postgres
    .exec(sql<CouponCode[]>`
      DELETE FROM content.coupon_code
      WHERE code = ${code}
      AND item_id = ${itemId}
      AND uses = 0
      RETURNING *;
    `)
    .then(firstRow);

  if (deleted) {
    return deleted;
  }

  return postgres
    .exec(sql<CouponCode[]>`
      UPDATE content.coupon_code
      SET deleted_at = NOW()
      WHERE code = ${code}
      AND item_id = ${itemId}
      RETURNING *;
    `)
    .then(firstRow)
    .then(rejectOnEmpty);
};
