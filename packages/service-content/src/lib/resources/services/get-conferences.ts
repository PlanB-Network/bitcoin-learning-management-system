import type { JoinedConference } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getConferencesQuery } from '../queries/get-conferences.js';

export const createGetConferences = ({ postgres }: Dependencies) => {
  return (projectId?: string): Promise<JoinedConference[]> => {
    return postgres.exec(getConferencesQuery(projectId));
  };
};
