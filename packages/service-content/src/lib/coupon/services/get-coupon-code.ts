import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getCouponCode } from '../queries/get-coupon-code.js';

export const createGetCouponCode = ({ postgres }: Dependencies) => {
  return async (code: string, itemId: string) => {
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
