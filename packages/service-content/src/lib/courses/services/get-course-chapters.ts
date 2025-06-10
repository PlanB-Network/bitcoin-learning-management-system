import type { JoinedCourseChapter } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getCourseChaptersQuery } from '../queries/get-course-chapters.js';

export const createGetCourseChapters = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return (
    courseId: string,
    language?: string,
  ): Promise<JoinedCourseChapter[]> => {
    return postgres.exec(getCourseChaptersQuery({ courseId, language }));
  };
};
