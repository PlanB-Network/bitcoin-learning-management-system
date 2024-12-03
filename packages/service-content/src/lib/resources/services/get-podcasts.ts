import type { JoinedPodcast } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getPodcastsQuery } from '../queries/get-podcasts.js';

export const createGetPodcasts = ({ postgres }: Dependencies) => {
  return async (): Promise<JoinedPodcast[]> => {
    return postgres.exec(getPodcastsQuery());
  };
};
