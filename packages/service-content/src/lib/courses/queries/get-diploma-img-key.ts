import { sql } from '@blms/database';

export const getCertificateImgKeyByExamAttemptIdQuery = (
  examAttemptId: string,
) => {
  return sql<{ imgKey: string | null }[]>`
      SELECT img_key
      FROM users.exam_timestamps
      WHERE exam_attempt_id = ${examAttemptId}
      LIMIT 1;
    `;
};
