import { firstRow } from '@blms/database';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';
import { getConferenceMetaQuery } from '../queries/get-conference-meta.js';

export const createGetConferenceMeta = ({ postgres }: Dependencies) => {
  return async (resourceId: string) => {
    const conference = await postgres
      .exec(getConferenceMetaQuery(resourceId))
      .then(firstRow);

    if (!conference) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Conference ${resourceId} not found`,
      });
    }

    return conference;
  };
};
