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
      email: 'trigger@planb.network',
      subject: subject,
      template: '',
      data: {},
    });
  };
};
