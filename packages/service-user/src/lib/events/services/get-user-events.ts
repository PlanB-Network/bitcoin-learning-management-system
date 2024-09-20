import type { Dependencies } from '../../../dependencies.js';
import { getUserEventsQuery } from '../queries/get-user-events.js';

interface Options {
  uid: string;
}

export const createGetUserEvents = ({ postgres }: Dependencies) => {
  return ({ uid }: Options) => {
    return postgres.exec(getUserEventsQuery(uid));
  };
};
