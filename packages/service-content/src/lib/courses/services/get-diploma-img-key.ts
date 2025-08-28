import type { Dependencies } from '../../dependencies.js';
import { getCertificateImgKeyByExamAttemptIdQuery } from '../queries/get-diploma-img-key.js';

export const createGetCertificateImgKeyByExamAttemptId = ({
  postgres,
}: Dependencies) => {
  return async (examAttemptId: string): Promise<string | null> => {
    const result = await postgres.exec(
      getCertificateImgKeyByExamAttemptIdQuery(examAttemptId),
    );

    if (!result || result.length === 0) {
      return null;
    }

    return result[0].imgKey;
  };
};
