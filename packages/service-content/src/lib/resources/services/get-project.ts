import { firstRow } from '@blms/database';
import type { JoinedProject } from '@blms/types';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';
import { getProjectQuery } from '../queries/get-project.js';

export const createGetProject = ({ postgres }: Dependencies) => {
  return async (id: string, language?: string): Promise<JoinedProject> => {
    const project = await postgres
      .exec(getProjectQuery(id, language))
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
