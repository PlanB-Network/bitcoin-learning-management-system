import { Dependencies } from '../../../dependencies.js';
import { updatePayment } from '../queries/update-payment.js';

export const createUpdatePayment =
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
      updatePayment({
        id,
        isPaid,
        isExpired,
      }),
    );
  };
