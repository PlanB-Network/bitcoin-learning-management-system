import { Dependencies } from '../../../dependencies';
import { insertPayment } from '../queries/insert-payment';

export const createSavePayment =
  (dependencies: Dependencies) =>
  async ({
    uid,
    courseId,
    paymentStatus,
    amount,
    paymentId,
    invoiceUrl,
  }: {
    uid: string;
    courseId: string;
    paymentStatus: string;
    amount: number;
    paymentId: string;
    invoiceUrl: string;
  }) => {
    const { postgres } = dependencies;

    await postgres.exec(
      insertPayment({
        uid,
        courseId,
        paymentStatus,
        amount,
        paymentId,
        invoiceUrl,
      }),
    );
  };
