import type { JoinedBCertificateResults } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getBCertResultsQuery } from '../queries/get-bcert-results.js';

export const createGetBCertResults = ({ postgres }: Dependencies) => {
  return (uid: string): Promise<JoinedBCertificateResults[]> => {
    return postgres.exec(getBCertResultsQuery(uid));
  };
};
