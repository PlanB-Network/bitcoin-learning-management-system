import { firstRow } from '@blms/database';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';
import { getNewsletterMetaQuery } from '../queries/get-newsletter-meta.js';

export const createGetNewsletterMeta = ({ postgres }: Dependencies) => {
  return async (id: string) => {
    const newsletter = await postgres
      .exec(getNewsletterMetaQuery(id))
      .then(firstRow);

    if (!newsletter) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Newsletter ${id} not found`,
      });
    }

    return newsletter;
  };
};
