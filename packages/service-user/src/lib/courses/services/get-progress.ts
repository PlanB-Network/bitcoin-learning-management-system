import type { CourseProgressExtended } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getCompletedChaptersQuery } from '../queries/get-completed-chapters.js';
import { getNextChaptersQuery } from '../queries/get-next-chapters.js';
import { getProgressQuery } from '../queries/get-progress.js';

interface Options {
  uid: string;
  courseId?: string;
}

export const createGetProgress = ({ postgres }: Dependencies) => {
  return async ({
    uid,
    courseId,
  }: Options): Promise<CourseProgressExtended[]> => {
    const progress = await postgres.exec(getProgressQuery(uid, courseId));
    const completedChapters = await postgres.exec(
      getCompletedChaptersQuery(uid),
    );
    const nextChapters = await postgres.exec(getNextChaptersQuery(uid));

    return progress.map((course) => {
      const chapters = completedChapters
        .filter((chapter) => chapter.courseId === course.courseId)
        .map(({ chapterId, completedAt }) => ({
          chapterId,
          completedAt,
        }));

      const nextChapter = nextChapters.find(
        (chapter) => chapter.courseId === course.courseId,
      );

      const lastCompletedChapter = chapters.at(-1);

      return {
        ...course,
        progressPercentage:
          course.progressPercentage > 100 ? 100 : course.progressPercentage,
        chapters,
        nextChapter,
        lastCompletedChapter,
      };
    });
  };
};
