import type { Dependencies } from '../../../dependencies.js';
import { getEventParticipants } from '../queries/get-participants.js';

export const createGetParticipantsForEvent = ({ postgres }: Dependencies) => {
  return () => {
    return postgres.exec(getEventParticipants());
  };
};
