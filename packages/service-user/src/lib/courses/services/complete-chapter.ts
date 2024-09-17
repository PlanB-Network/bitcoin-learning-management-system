import type { CourseProgress } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { completeChapterQuery } from '../queries/complete-chapter.js';

interface Options {
  uid: string;
  courseId: string;
  chapterId: string;
}

export const createCompleteChapter = ({ postgres }: Dependencies) => {
  return ({ uid, courseId, chapterId }: Options): Promise<CourseProgress[]> => {
    return postgres.exec(completeChapterQuery(uid, courseId, chapterId));
  };
};
