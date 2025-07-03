import type {
  JoinedTutorialLight,
  TutorialWithProfessorName,
} from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import {
  getSortedTutorialsWithProfessorNameQuery,
  getTutorialsQuery,
} from '../queries/get-tutorials.js';

interface Options {
  language: string;
  search: string;
  orderField:
    | 'category'
    | 'professorName'
    | 'title'
    | 'likeCount'
    | 'dislikeCount';
  orderDirection: 'asc' | 'desc';
  limit?: number;
  cursor?: {
    id: string;
    value: string | number;
  };
  professorId?: string;
}

export const createGetTutorials = ({ postgres }: Dependencies) => {
  return (
    category?: string,
    language?: string,
  ): Promise<JoinedTutorialLight[]> => {
    return postgres.exec(getTutorialsQuery(category, language));
  };
};

export const createGetTutorialsWithProfessorName = ({
  postgres,
}: Dependencies) => {
  return async ({
    language = 'en',
    search,
    orderField = 'likeCount',
    orderDirection = 'desc',
    limit = 50,
    cursor,
    professorId,
  }: Options): Promise<{
    tutorials: TutorialWithProfessorName[];
    nextCursor: { id: string; value: string | number } | null;
  }> => {
    const data = await postgres.exec(
      getSortedTutorialsWithProfessorNameQuery(
        language,
        search,
        orderField,
        orderDirection,
        limit + 1,
        cursor,
        professorId,
      ),
    );

    let nextCursor: { id: string; value: string | number } | null = null;
    if (data.length > limit) {
      const lastItem = data.pop();
      if (lastItem) {
        nextCursor = {
          id: lastItem.id,
          value: String(lastItem[orderField]),
        };
      }
    }

    return { nextCursor, tutorials: data };
  };
};
