export type * from './changed-file.js';
export type * from './config.js';
export type * from './generated/content/translations.js';
export type * from './generated/index.js';
export type * from './generated/users/translations.js';
export type * from './search.js';
export type * from './session.js';
export type * from './utils.js';

export type SwissBitcoinPayInvoiceStatus =
  | 'draft'
  | 'open'
  | 'underpaid'
  | 'unconfirmed'
  | 'settled'
  | 'canceled'
  | 'expired';

/**
 * Invoice as returned by SwissBitcoinPay `GET /checkout/{id}`
 * (https://docs.swiss-bitcoin-pay.ch/)
 */
export type SwissBitcoinPayCheckout = (
  | { isPaid: true; isExpired: false }
  | { isPaid: false; isExpired: true }
) & {
  id: string;
  status: SwissBitcoinPayInvoiceStatus;
  /** Invoice amount, in sats */
  amount: number;
};

export type LogContext = {
  log: (...args: any[]) => void;
};
