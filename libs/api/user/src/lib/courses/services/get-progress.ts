import { Dependencies } from '../../../dependencies';
import { getCompletedChaptersQuery, getProgressQuery } from '../queries';

export const createGetProgress =
  (dependencies: Dependencies) =>
  async ({ uid }: { uid: string }) => {
    const { postgres } = dependencies;

    const progress = await postgres.exec(getProgressQuery(uid));
    const completedChapters = await postgres.exec(
      getCompletedChaptersQuery(uid),
    );

    return progress.map((course) => {
      const chapters = completedChapters
        .filter((chapter) => chapter.course_id === course.course_id)
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
