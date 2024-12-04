import { firstRow } from '@blms/database';
import type { JoinedPodcast } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getPodcastQuery } from '../queries/get-podcast.js';

export const createGetPodcast = ({ postgres }: Dependencies) => {
  return async (id: number): Promise<JoinedPodcast> => {
    const podcast = await postgres.exec(getPodcastQuery(id)).then(firstRow);

    if (!podcast) {
      throw new Error('Podcast not found');
    }

    return podcast;
  };
};
