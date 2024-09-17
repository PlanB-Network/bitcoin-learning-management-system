import type { EventPayment } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getEventPaymentsQuery } from '../queries/get-event-payments.js';

interface Options {
  uid: string;
}

export const createGetEventPayments = ({ postgres }: Dependencies) => {
  return ({ uid }: Options): Promise<EventPayment[]> => {
    return postgres.exec(getEventPaymentsQuery(uid));
  };
};
