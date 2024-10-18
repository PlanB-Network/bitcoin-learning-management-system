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

    // const quizAttempts = await postgres.exec(getQuizAttemptsQuery(uid));

    return progress.map((course) => {
      const chapters = completedChapters
        .filter((chapter) => chapter.courseId === course.courseId)
        .map(({ chapterId, completedAt }) => ({
          chapterId,
          // quiz: _.pick(
          //   quizAttempts.find(
          //     (attempt) =>
          //       attempt.courseId === course.courseId &&
          //       attempt.chapterId === chapterId,
          //   ),
          //   ['questions_count', 'correct_answers_count', 'done_at'],
          // ),
          completedAt,
        }));
      // .sort((a, b) => {
      //   return a.chapterId - b.chapterId; // todo chapterIndex
      // })

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
