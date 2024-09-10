import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { computeAssetCdnUrl } from '../../utils.js';
import { getCourseMetaQuery } from '../queries/get-course-meta.js';

export const createGetCourseMeta = ({ postgres }: Dependencies) => {
  // TODO: Add return type
  return async (id: string, language: string) => {
    const course = await postgres
      .exec(getCourseMetaQuery(id, language))
      .then(firstRow);

    if (!course) {
      throw new Error(`Course ${id} not found`);
    }

    return {
      ...course,
      thumbnail: computeAssetCdnUrl(
        course.lastCommit,
        `courses/${course.id}`,
        'thumbnail.webp',
      ),
    };
  };
};
