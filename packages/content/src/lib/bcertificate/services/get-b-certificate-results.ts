import type { Dependencies } from '../../dependencies.js';
import { getBCertificateResultsQuery } from '../queries/get-b-certificate-results.js';

export const createGetBCertificateResults = (dependencies: Dependencies) => {
  return async (uid: string) => {
    const { postgres } = dependencies;

    return postgres.exec(getBCertificateResultsQuery(uid));
  };
};
