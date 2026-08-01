import { firstRow } from '@blms/database';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';
import { getProjectMetaQuery } from '../queries/get-project-meta.js';

export const createGetProjectMeta = ({ postgres }: Dependencies) => {
  return async (resourceId: string, language?: string) => {
    const project = await postgres
      .exec(getProjectMetaQuery(resourceId, language))
      .then(firstRow);

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      });
    }

    return project;
  };
};
