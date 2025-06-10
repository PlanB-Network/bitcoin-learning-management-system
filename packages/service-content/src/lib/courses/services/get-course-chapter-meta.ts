import { firstRow } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getCourseChapterMetaQuery } from '../queries/get-course-chapter-meta.js';

export const createGetCourseChapterMeta = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async (chapterId: string, language: string) => {
    const chapter = await postgres
      .exec(getCourseChapterMetaQuery(chapterId, language))
      .then(firstRow);

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    return chapter;
  };
};
