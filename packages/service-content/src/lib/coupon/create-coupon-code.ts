import { sql } from '@blms/database';
import { nanoid } from '@blms/service-common';
import type { CouponCode } from '@blms/types';
import type { Dependencies } from '../dependencies.js';

interface Options {
  singleUse: boolean;
  code: string | null; // Ignored if single-use (code will be generated)
  maxUses: number; // Ignored if singleUse is true
  numberOfCodes: number; // Ignored if multi-use
  itemId: string;
  reductionPercentage: number;
}

export const createCreateCouponCode = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return (options: Options, uid: string) => {
    console.log('Creating coupon code', options);

    // Single-use coupon
    if (options.singleUse) {
      // Generate multiple codes
      const codes: string[] = Array.from(
        { length: options.numberOfCodes },
        () => nanoid().toUpperCase(),
      );

      console.log('Generated codes', codes);

      return postgres.exec(sql<CouponCode[]>`
        INSERT INTO content.coupon_code (code, item_id, uid, reduction_percentage, max_uses)
          VALUES ${sql(codes.map((code) => [code, options.itemId, uid, options.reductionPercentage, 1]))}
          RETURNING *;
      `);
    }

    // Cannot generate multiple multi-use codes
    if (options.numberOfCodes > 1) {
      throw new Error('Cannot generate multiple codes for unique coupon');
    }

    // Generate multi-use code
    const code = options.code?.trim() || nanoid().toUpperCase();
    return postgres.exec(sql<CouponCode[]>`
    INSERT INTO content.coupon_code (code, item_id, uid, reduction_percentage, max_uses)
      VALUES (${code}, ${options.itemId}, ${uid}, ${options.reductionPercentage}, ${options.maxUses})
      RETURNING *;
    `);
  };
};
