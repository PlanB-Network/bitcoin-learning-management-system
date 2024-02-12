import { Dependencies } from '../../../dependencies.js';
import { getPaymentQuery } from '../queries/get-payment.js';

export const createGetPayment =
  (dependencies: Dependencies) =>
  async ({ uid }: { uid: string }) => {
    const { postgres } = dependencies;

    return postgres.exec(getPaymentQuery(uid));
  };
