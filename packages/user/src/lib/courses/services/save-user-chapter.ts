import type { Dependencies } from '../../../dependencies.js';
import { insertUserChapter } from '../queries/insert-user-chapter.js';

export const createSaveUserChapter =
  (dependencies: Dependencies) =>
  async ({
    uid,
    courseId,
    chapterId,
    booked,
  }: {
    uid: string;
    courseId: string;
    chapterId: string;
    booked: boolean;
  }) => {
    const { postgres } = dependencies;

    return postgres.exec(
      insertUserChapter({ uid, courseId, chapterId, booked }),
    );
  };
