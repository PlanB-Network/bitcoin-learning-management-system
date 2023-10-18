import _ from 'lodash';

import { Dependencies } from '../../../dependencies';
import {
  getCompletedChaptersQuery,
  getNextChaptersQuery,
  getProgressQuery,
  getQuizAttemptsQuery,
} from '../queries';

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
        .filter((chapter) => chapter.course_id === course.course_id)
        .map(({ part, chapter, completed_at }) => ({
          chapter,
          part,
          quiz: _.pick(
            quizAttempts.find(
              (attempt) =>
                attempt.course_id === course.course_id &&
                attempt.part === part &&
                attempt.chapter === chapter,
            ),
            ['questions_count', 'correct_answers_count', 'done_at'],
          ),
          completed_at,
        }))
        .sort((a, b) => {
          if (a.part !== b.part) {
            return a.part - b.part;
          }
          return a.chapter - b.chapter;
        });

      const nextChapter = nextChapters.find(
        (chapter) => chapter.course_id === course.course_id,
      );

      const lastCompletedChapter = chapters[chapters.length - 1];

      return {
        ...course,
        chapters,
        nextChapter,
        lastCompletedChapter,
      };
    });
  };
