import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getProjectMetaQuery } from '../queries/get-project-meta.js';

export const createGetProjectMeta = ({ postgres }: Dependencies) => {
  return async (resourceId: string, language?: string) => {
    const project = await postgres
      .exec(getProjectMetaQuery(resourceId, language))
      .then(firstRow);

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  };
};
