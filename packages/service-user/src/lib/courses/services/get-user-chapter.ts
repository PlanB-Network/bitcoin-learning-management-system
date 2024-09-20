import type { GetUserChapterResponse } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getUserChapterQuery } from '../queries/get-user-chapter.js';

interface Options {
  uid: string;
  courseId: string;
}

export const createGetUserChapter = ({ postgres }: Dependencies) => {
  return ({ uid, courseId }: Options): Promise<GetUserChapterResponse[]> => {
    return postgres.exec(getUserChapterQuery(uid, courseId));
  };
};
