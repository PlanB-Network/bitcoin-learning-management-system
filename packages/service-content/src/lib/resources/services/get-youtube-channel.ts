import { firstRow } from '@blms/database';
import type { JoinedYoutubeChannel } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getYoutubeChannelQuery } from '../queries/get-youtube-channel.js';

export const createGetYoutubeChannel = ({ postgres }: Dependencies) => {
  return async (id: string): Promise<JoinedYoutubeChannel> => {
    const channel = await postgres
      .exec(getYoutubeChannelQuery(id))
      .then(firstRow);

    if (!channel) {
      throw new Error('Channel not found');
    }

    return channel;
  };
};
