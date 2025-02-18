import { firstRow } from '@blms/database';
import type { JoinedConference } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getConferenceQuery } from '../queries/get-conference.js';

export const createGetConference = ({ postgres }: Dependencies) => {
  return async (id: string): Promise<JoinedConference> => {
    const conference = await postgres
      .exec(getConferenceQuery(id))
      .then(firstRow);

    if (!conference) {
      throw new Error(`Conference ${id} not found`);
    }

    return conference;
  };
};
