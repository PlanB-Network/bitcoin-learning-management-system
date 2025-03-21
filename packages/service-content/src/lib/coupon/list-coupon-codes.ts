import { sql } from '@blms/database';
import type { CouponCodeWithOwner } from '@blms/types';

import type { Dependencies } from '../dependencies.js';

interface ListOptions {
  page: number;
  limit: number;
  singleUse: boolean | null;
}

const getCouponCodes = (options: ListOptions) => {
  return sql<CouponCodeWithOwner[]>`
    SELECT *, username as owner
      FROM content.coupon_code
      LEFT JOIN users.accounts ON accounts.uid = coupon_code.uid
      ${options.singleUse === null ? sql`` : options.singleUse ? sql`WHERE max_uses = 1` : sql`WHERE max_uses > 1`}
      LIMIT ${options.limit}
      OFFSET ${(options.page - 1) * options.limit}
      ;
  `;
};

export const createListCouponCodes = ({ postgres }: Dependencies) => {
  return (options: ListOptions) => postgres.exec(getCouponCodes(options));
};
