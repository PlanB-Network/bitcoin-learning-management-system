import {
  completeChapterQuery,
  getCoursesProgressQuery,
  getUserCompletedChaptersQuery,
} from '@sovereign-academy/database';

import { Dependencies } from '../../dependencies';

export const createCompleteChapter =
  (dependencies: Dependencies) =>
  async (uid: string, courseId: string, language: string, chapter: number) => {
    const { postgres } = dependencies;

    return postgres.exec(
      completeChapterQuery(uid, courseId, language, chapter)
    );
  };

export const createGetCoursesProgress =
  (dependencies: Dependencies) => async (uid: string) => {
    const { postgres } = dependencies;

    const progress = await postgres.exec(getCoursesProgressQuery(uid));
    const completedChapters = await postgres.exec(
      getUserCompletedChaptersQuery(uid)
    );

    return progress.map((course) => {
      const chapters = completedChapters
        .filter(
          (chapter) =>
            chapter.course_id === course.course_id &&
            chapter.language === course.language
        )
        .map(({ chapter, completed_at }) => ({
          chapter,
          completed_at,
        }))
        .sort((a, b) => a.chapter - b.chapter);

      const lastCompletedChapter = chapters[chapters.length - 1];

      return {
        ...course,
        chapters,
        lastCompletedChapter,
      };
    });
  };
