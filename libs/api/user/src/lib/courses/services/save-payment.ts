import axios from 'axios';

import { Dependencies } from '../../../dependencies';
import { insertPayment } from '../queries/insert-payment';

export const createSavePayment =
  (dependencies: Dependencies) =>
  async ({ uid, courseId }: { uid: string; courseId: string }) => {
    const { postgres } = dependencies;

    const paymentData = {
      title: courseId,
      amount: 1,
      unit: 'sat',
      onChain: true,
      webhook: `${process.env['PUBLIC_PROXY_URL']}/api/users/courses/payment/webhooks`,
    };
    const { data: checkoutData } = await axios.post<{
      id: string;
      pr: string;
      onChainAddr: string;
      amount: number;
      checkoutUrl: string;
    }>(`https://api.swiss-bitcoin-pay.ch/checkout`, paymentData, {
      headers: {
        'api-key': process.env['SBP_API_KEY'],
      },
    });

    await postgres.exec(
      insertPayment({
        uid,
        courseId,
        paymentStatus: 'pending',
        amount: checkoutData.amount,
        paymentId: checkoutData.id,
        invoiceUrl: checkoutData.checkoutUrl,
      }),
    );

    return checkoutData;
  };
