import type { CourseStudent } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { getStudentsByCourseIdQuery } from '../queries/get-students.js';

interface Options {
  search: string;
  orderField:
    | 'displayName'
    | 'amount'
    | 'courseProgress'
    | 'totalScore'
    | 'lastActive';
  orderDirection: 'asc' | 'desc';
  limit?: number;
  cursor?: {
    uid: string;
    value: string | number;
  };
  courseId?: string;
}

export const createGetStudentsByCourseId = ({ postgres }: Dependencies) => {
  return async ({
    courseId,
    search,
    orderField = 'displayName',
    orderDirection = 'desc',
    limit = 100,
    cursor,
  }: Options): Promise<{
    students: CourseStudent[];
    nextCursor: { uid: string; value: string | number } | null;
  }> => {
    const data = await postgres.exec(
      getStudentsByCourseIdQuery(
        search,
        orderField,
        orderDirection,
        limit + 1,
        cursor,
        courseId,
      ),
    );

    let nextCursor: { uid: string; value: string | number } | null = null;
    if (data.length > limit) {
      const lastItem = data.pop();
      if (lastItem) {
        nextCursor = {
          uid: lastItem.uid,
          value: String(lastItem[orderField]),
        };
      }
    }

    return { nextCursor, students: data };
  };
};
