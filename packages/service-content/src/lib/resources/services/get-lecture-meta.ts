import { firstRow } from '@blms/database';
import type { JoinedEvent } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getLectureQuery } from '../queries/get-lecture.js';

export const createGetLectureMeta = ({ postgres }: Dependencies) => {
  return async (id: string): Promise<JoinedEvent> => {
    const lecture = await postgres.exec(getLectureQuery(id)).then(firstRow);

    if (!lecture) {
      throw new Error('Lecture not found');
    }

    lecture.replayUrl = null;
    lecture.liveUrl = null;

    return lecture;
  };
};
