import { firstRow } from '@blms/database';
import type { JoinedEvent } from '@blms/types';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';
import { getEventQuery } from '../queries/get-event.js';

export const createGetEvent = ({ postgres }: Dependencies) => {
  return async (id: string, isAllowed = true): Promise<JoinedEvent> => {
    const event = await postgres.exec(getEventQuery(id)).then(firstRow);

    if (!event) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Event ${id} not found`,
      });
    }

    if (!isAllowed) {
      event.replayUrl = '';
      event.liveUrl = '';
      event.chatUrl = '';
    }
    return event;
  };
};
