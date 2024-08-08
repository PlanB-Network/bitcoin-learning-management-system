import type { Dependencies } from '../../../dependencies.js';
import { updateCoupon } from '../queries/update-coupon.js';
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

    if (isPaid) {
      await postgres.exec(
        updateCoupon({
          paymentId: id,
        }),
      );
    }
  };
