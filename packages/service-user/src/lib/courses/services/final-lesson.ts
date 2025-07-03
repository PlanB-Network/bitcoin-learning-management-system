import { sql } from '@blms/database';
import type { Dependencies } from '../../../dependencies.js';
import { createSendEmail } from '../../account/services/email.js';
import { withdrawUserFromCourseFinalLesson } from '../queries/final-lesson.js';

interface Options {
  uid: string;
  courseId: string;
}

export const createWithdrawUserFromCourseFinalLesson = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async (options: Options): Promise<void> => {
    const { postgres, config } = dependencies;

    await postgres
      .exec(withdrawUserFromCourseFinalLesson(options))
      .then(() => void 0);

    const res = await sql`
        SELECT
          username
        FROM
          users.accounts
        WHERE
          uid = ${options.uid}
        LIMIT 1
      `;

    const username = res[0].username;

    const sendEmail = createSendEmail({ config });
    const subject = `${process.env.PLANB_ENVIRONMENT !== 'mainnet' ? '[TEST] - ' : ''} User ${username} withdrawn from final lesson.`;

    await sendEmail({
      data: { subject: subject, username: username },
      email: 'asi0@planb.network',
      subject: subject,
      template: 'd-10e6dac708224b17bb8b3c2d5336de93',
    });
  };
};
