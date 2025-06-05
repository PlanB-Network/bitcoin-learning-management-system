import type { Dependencies } from '../../../dependencies.js';
import { getEventParticipants } from '../queries/get-participants.js';

export const createGetParticipantsForEvent = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return () => {
    return postgres.exec(getEventParticipants());
  };
};
