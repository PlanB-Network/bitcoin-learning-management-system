import _ from 'lodash';

import type { Dependencies } from '../../../dependencies.js';
import {
  getCompletedChaptersQuery,
  getNextChaptersQuery,
  getProgressQuery,
  getQuizAttemptsQuery,
} from '../queries/index.js';

export const createGetProgress =
  (dependencies: Dependencies) =>
  async ({ uid }: { uid: string }) => {
    const { postgres } = dependencies;

    const progress = await postgres.exec(getProgressQuery(uid));
    const completedChapters = await postgres.exec(
      getCompletedChaptersQuery(uid),
    );
    const nextChapters = await postgres.exec(getNextChaptersQuery(uid));

    const quizAttempts = await postgres.exec(getQuizAttemptsQuery(uid));

    return progress.map((course) => {
      const chapters = completedChapters
        .filter((chapter) => chapter.courseId === course.courseId)
        .map(({ part, chapter, completedAt }) => ({
          chapter,
          part,
          quiz: _.pick(
            quizAttempts.find(
              (attempt) =>
                attempt.courseId === course.courseId &&
                attempt.part === part &&
                attempt.chapter === chapter,
            ),
            ['questions_count', 'correct_answers_count', 'done_at'],
          ),
          completedAt,
        }))
        .sort((a, b) => {
          if (a.part !== b.part) {
            return a.part - b.part;
          }
          return a.chapter - b.chapter;
        });

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
