import type { Dependencies } from '../../../dependencies.js';
import { insertUserChapter } from '../queries/insert-user-chapter.js';

export const createSaveUserChapter =
  (dependencies: Dependencies) =>
  async ({
    uid,
    courseId,
    part,
    chapter,
    booked,
  }: {
    uid: string;
    courseId: string;
    part: number;
    chapter: number;
    booked: boolean;
  }) => {
    const { postgres } = dependencies;

    return postgres.exec(
      insertUserChapter({ uid, courseId, part, chapter, booked }),
    );
  };
