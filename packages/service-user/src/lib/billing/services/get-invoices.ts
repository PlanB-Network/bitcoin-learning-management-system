import type { Invoice } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getInvoicesQuery } from '../queries/get-invoices.js';

interface Options {
  uid: string;
  language: string;
}

export const createGetInvoices = ({ postgres }: Dependencies) => {
  return ({ uid, language }: Options): Promise<Invoice[]> => {
    return postgres.exec(getInvoicesQuery(uid, language));
  };
};
