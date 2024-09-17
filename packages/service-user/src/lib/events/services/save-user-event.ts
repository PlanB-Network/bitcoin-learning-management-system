import type { UserEvent } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { insertUserEvent } from '../queries/insert-user-event.js';

interface Options {
  uid: string;
  eventId: string;
  booked: boolean;
  withPhysical: boolean;
}

export const createSaveUserEvent = ({ postgres }: Dependencies) => {
  return (options: Options): Promise<UserEvent[]> => {
    return postgres.exec(insertUserEvent(options));
  };
};
