import type { Dependencies } from '../../../dependencies.js';
import { updateEventPayment } from '../queries/update-event-payment.js';

export const createUpdateEventPayment =
  (dependencies: Dependencies) =>
  async ({
    id,
    isPaid,
    isExpired,
  }: {
    id: string;
    isPaid: boolean;
    isExpired: boolean;
  }) => {
    const { postgres } = dependencies;

    await postgres.exec(
      updateEventPayment({
        id,
        isPaid,
        isExpired,
      }),
    );
  };
