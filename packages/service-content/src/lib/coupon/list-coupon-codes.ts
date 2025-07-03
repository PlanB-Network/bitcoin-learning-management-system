import { sql } from '@blms/database';
import type { CouponCodeWithOwner } from '@blms/types';

import type { Dependencies } from '../dependencies.js';

interface ListOptions {
  page: number;
  limit: number;
  singleUse: boolean | null;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const getCouponCodes = (options: ListOptions) => {
  // Important: this is a map of the database column names to the API sort keys
  // This is important to prevent SQL injection attacks thant we ensure that
  // the sortBy value is one of the keys in this map and not a user input
  const sortMap = {
    code: sql`code`,
    createdAt: sql`coupon_code.created_at`,
    maxUses: sql`max_uses`,
    // Note: it is not possible to sort by name, because it points to both
    // content.courses_localized and content.events tables
    name: sql`coupon_code.item_id`,
    owner: sql`username`,
    reductionPercentage: sql`reduction_percentage`,
    updatedAt: sql`coupon_code.updated_at`,
    uses: sql`uses`,
  } as const;

  const sort = sortMap[options.sortBy as keyof typeof sortMap] || null;
  const dir = sql.unsafe(options.sortDirection === 'asc' ? 'ASC' : 'DESC');

  return sql<CouponCodeWithOwner[]>`
    SELECT coupon_code.*, username as owner
      FROM content.coupon_code
      LEFT JOIN users.accounts ON accounts.uid = coupon_code.uid
      WHERE deleted_at IS NULL
      ${options.singleUse === null ? sql`` : options.singleUse ? sql`AND max_uses = 1` : sql`AND max_uses > 1`}
      ${sort ? sql`ORDER BY ${sort} ${dir}` : sql``}
      LIMIT ${options.limit}
      OFFSET ${(options.page - 1) * options.limit}
      ;
  `;
};

export const createListCouponCodes = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return (options: ListOptions) => postgres.exec(getCouponCodes(options));
};
