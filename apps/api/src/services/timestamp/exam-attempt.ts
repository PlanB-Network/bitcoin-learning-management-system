import { firstRow, rejectOnEmpty, sql } from '@blms/database';
import {
  createTimestamp,
  createUpgrade,
  createVerify,
  loadPrivateKey,
} from '@blms/opentimestamps';
import type { UserExamTimestamp } from '@blms/types';

import { opentimestamps } from '#src/config.js';
import type { Dependencies } from '#src/dependencies.js';

interface TimestampOptions {
  examAttemptId: string;
  text: string;
}

interface VerifyReturn {
  height: number;
  timestamp: number;
}

export const createExamTimestampService = async (ctx: Dependencies) => {
  const privateKey = await loadPrivateKey(opentimestamps);

  const timestamp = createTimestamp(privateKey);
  const upgrade = createUpgrade();
  const verify = createVerify({ ignoreBitcoinNode: true });

  const getExamTimestamp = (id: string): Promise<UserExamTimestamp> => {
    return ctx.postgres
      .exec(
        sql<UserExamTimestamp[]>`
          SELECT * FROM users.exam_timestamps
          WHERE exam_attempt_id = ${id}
        `,
      )
      .then(firstRow)
      .then(rejectOnEmpty);
  };

  const verifyExamTimestamp = (examAttemptId: string) => {
    return getExamTimestamp(examAttemptId) //
      .then(({ hash, ots }) => verify(ots, hash))
      .then((res: VerifyReturn | null) => res);
  };

  const validateExamTimestamp = (examAttemptId: string) => {
    return verifyExamTimestamp(examAttemptId) //
      .then((res) => {
        if (!res) {
          return null;
        }

        return ctx.postgres.exec(
          sql<UserExamTimestamp[]>`
              UPDATE users.exam_timestamps
              SET height = ${res.height},
                  timestamp = ${res.timestamp},
                  confirmed = true,
                  confirmed_at = NOW()
              WHERE exam_attempt_id = ${examAttemptId}
            `,
        );
      })
      .then((res) => !!res);
  };

  const upgradeAndValidate = (examAttemptId: string) => {
    return getExamTimestamp(examAttemptId) //
      .then(({ ots }) => upgrade(ots))
      .then((ots) => {
        if (!ots) {
          return null;
        }

        // Save the upgraded ots
        return ctx.postgres.exec(
          sql<UserExamTimestamp[]>`
              UPDATE users.exam_timestamps
              SET ots = ${ots}
              WHERE exam_attempt_id = ${examAttemptId}
            `,
        );
      })
      .then((ots) => {
        if (!ots) {
          return null;
        }

        // Save the upgraded ots
        return validateExamTimestamp(examAttemptId);
      })
      .then((res) => !!res);
  };

  const timestampExamAttempt = ({ text, examAttemptId }: TimestampOptions) => {
    return timestamp({ text })
      .then(({ text, signature, ots, hash }) =>
        ctx.postgres.exec(
          sql<UserExamTimestamp[]>`
              INSERT INTO users.exam_timestamps (exam_attempt_id, txt, sig, hash, ots)
              VALUES (${examAttemptId}, ${text}, ${signature}, ${hash}, ${ots})
              RETURNING
            `,
        ),
      )
      .then(() => true);
  };

  return {
    getExamTimestamp,
    timestampExamAttempt,
    upgradeAndValidate,
    verifyExamTimestamp,
  };
};
