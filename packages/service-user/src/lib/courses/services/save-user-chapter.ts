import type { CourseUserChapter } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { insertUserChapter } from '../queries/insert-user-chapter.js';

interface Options {
  uid: string;
  courseId: string;
  chapterId: string;
  booked: boolean;
}

export const createSaveUserChapter = ({ postgres }: Dependencies) => {
  return (options: Options): Promise<CourseUserChapter[]> => {
    return postgres.exec(insertUserChapter(options));
  };
};
