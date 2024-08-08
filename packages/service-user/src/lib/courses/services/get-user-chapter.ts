import type { Dependencies } from '../../../dependencies.js';
import { getUserChapterQuery } from '../queries/get-user-chapter copy.js';

export const createGetUserChapter =
  (dependencies: Dependencies) =>
  async ({ uid, courseId }: { uid: string; courseId: string }) => {
    const { postgres } = dependencies;

    return postgres.exec(getUserChapterQuery(uid, courseId));
  };
