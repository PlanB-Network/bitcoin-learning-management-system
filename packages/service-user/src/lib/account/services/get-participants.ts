import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../../dependencies.js';
import { getAllParticipants } from '../queries/get-participants.js';

interface GetParticipantsForEventsOptions {
  eventIds: string[];
}

export const createGetParticipantsForEvents = ({ postgres }: Dependencies) => {
  return async ({ eventIds }: GetParticipantsForEventsOptions) => {
    if (!eventIds || eventIds.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Event IDs are required',
      });
    }

    const participants = await postgres.exec(getAllParticipants());

    const eventParticipants = participants.filter((participant) =>
      eventIds.includes(participant.eventId),
    );

    if (eventParticipants.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No participants found for the specified events',
      });
    }

    return eventParticipants;
  };
};
