import type { GetUserChapterResponse } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import {
  getUserChapterAttendanceQuery,
  getUserChapterQuery,
} from '../queries/get-user-chapter.js';

interface Options {
  uid: string;
  courseId: string;
}

export const createGetUserChapter = ({ postgres }: Dependencies) => {
  return ({ uid, courseId }: Options): Promise<GetUserChapterResponse[]> => {
    return postgres.exec(getUserChapterQuery(uid, courseId));
  };
};

export const createGetUserChapterAttendance = ({ postgres }: Dependencies) => {
  return async (chapterId: string): Promise<string[]> => {
    const rows = await postgres.exec(getUserChapterAttendanceQuery(chapterId));
    return rows.map((r) => r.displayName);
  };
};
