import type { Dependencies } from '../../../dependencies.js';
import { getEventPaymentsQuery } from '../queries/get-event-payments.js';

export const createGetEventPayments =
  (dependencies: Dependencies) =>
  async ({ uid }: { uid: string }) => {
    const { postgres } = dependencies;

    return postgres.exec(getEventPaymentsQuery(uid));
  };
