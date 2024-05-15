import type { Dependencies } from '../../../dependencies.js';
import { getInvoicesQuery } from '../queries/get-invoices.js';

export const createGetInvoices =
  (dependencies: Dependencies) =>
  async ({ uid }: { uid: string }) => {
    const { postgres } = dependencies;

    return postgres.exec(getInvoicesQuery(uid));
  };
