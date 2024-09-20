import type { Dependencies } from '../../../dependencies.js';
import { updateEventPayment } from '../queries/update-event-payment.js';

interface Options {
  id: string;
  isPaid: boolean;
  isExpired: boolean;
}

export const createUpdateEventPayment = ({ postgres }: Dependencies) => {
  return async (options: Options) => {
    await postgres.exec(updateEventPayment(options));
  };
};
