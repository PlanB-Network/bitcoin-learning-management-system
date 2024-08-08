import type { CourseProgressExtended } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getCompletedChaptersQuery } from '../queries/get-completed-chapters.js';
import { getNextChaptersQuery } from '../queries/get-next-chapters.js';
import { getProgressQuery } from '../queries/get-progress.js';

export const createGetProgress = (dependencies: Dependencies) => {
  return async ({
    uid,
  }: {
    uid: string;
  }): Promise<CourseProgressExtended[]> => {
    const { postgres } = dependencies;

    const progress = await postgres.exec(getProgressQuery(uid));
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
        chapters,
        nextChapter,
        lastCompletedChapter,
      };
    });
  };
};
