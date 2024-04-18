import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { getCouponCode } from '../queries/index.js';

export const createGetCouponCode =
  (dependencies: Dependencies) => async (code: string, itemId: string) => {
    const { postgres } = dependencies;
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
