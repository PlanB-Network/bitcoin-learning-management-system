import { Dependencies } from '../../../dependencies';
import { getPaymentQuery } from '../queries/get-payment';

export const createGetPayment =
  (dependencies: Dependencies) =>
  async ({ uid }: { uid: string }) => {
    const { postgres } = dependencies;

    return postgres.exec(getPaymentQuery(uid));
  };
