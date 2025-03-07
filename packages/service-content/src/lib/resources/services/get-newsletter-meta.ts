import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getNewsletterMetaQuery } from '../queries/get-newsletter-meta.js';

export const createGetNewsletterMeta = ({ postgres }: Dependencies) => {
  return async (id: string) => {
    const newsletter = await postgres
      .exec(getNewsletterMetaQuery(id))
      .then(firstRow);

    if (!newsletter) {
      throw new Error(`Conference ${id} not found`);
    }

    return newsletter;
  };
};
