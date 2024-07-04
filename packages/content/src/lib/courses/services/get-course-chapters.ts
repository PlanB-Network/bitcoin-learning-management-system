import type { JoinedCourseChapter } from '@sovereign-university/types';

import type { Dependencies } from '../../dependencies.js';
import { getCourseChaptersQuery } from '../queries/index.js';

export const createGetCourseChapters = (dependencies: Dependencies) => {
  return (
    courseId: string,
    language?: string,
  ): Promise<JoinedCourseChapter[]> => {
    const { postgres } = dependencies;

    return postgres.exec(getCourseChaptersQuery({ courseId, language }));
  };
};
