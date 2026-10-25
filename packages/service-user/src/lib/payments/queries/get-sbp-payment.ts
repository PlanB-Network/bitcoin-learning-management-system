import { sql } from '@blms/database';

import type { SbpPaymentType } from '../services/payment-service.js';

export interface SbpPayment {
  paymentId: string;
  paymentStatus: string;
  /** Amount in sats, as returned by SwissBitcoinPay when the checkout was created */
  amount: number;
}

export const getSbpPaymentQuery = (type: SbpPaymentType, id: string) => {
  switch (type) {
    case 'courses': {
      return sql<SbpPayment[]>`
        SELECT payment_id, payment_status, amount
        FROM users.course_payment
        WHERE payment_id = ${id} AND method = 'sbp'
      `;
    }
    case 'events': {
      return sql<SbpPayment[]>`
        SELECT payment_id, payment_status, amount
        FROM users.event_payment
        WHERE payment_id = ${id} AND method = 'sbp'
      `;
    }
    case 'general': {
      return sql<SbpPayment[]>`
        SELECT payment_id, payment_status, amount
        FROM users.general_payment
        WHERE payment_id = ${id} AND method = 'sbp'
      `;
    }
  }
};
