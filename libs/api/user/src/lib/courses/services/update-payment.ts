import { Dependencies } from '../../../dependencies';
import { updatePayment } from '../queries/update-payment';

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
