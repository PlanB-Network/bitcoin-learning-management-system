import { sql } from '@blms/database';
import type { GeneralPaymentLight } from '@blms/types';

export const getGeneralPaymentsQuery = (uid: string) => {
  return sql<GeneralPaymentLight[]>`
    SELECT item, payment_status, amount, payment_id, invoice_url
    FROM  users.general_payment
    WHERE uid = ${uid};
  `;
};
