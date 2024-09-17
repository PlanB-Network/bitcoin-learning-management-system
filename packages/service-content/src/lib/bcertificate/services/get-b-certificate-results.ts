import type { JoinedBCertificateResults } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getBCertificateResultsQuery } from '../queries/get-b-certificate-results.js';

export const createGetBCertificateResults = ({ postgres }: Dependencies) => {
  return (uid: string): Promise<JoinedBCertificateResults[]> => {
    return postgres.exec(getBCertificateResultsQuery(uid));
  };
};
