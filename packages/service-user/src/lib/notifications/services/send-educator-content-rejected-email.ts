import { firstRow } from '@blms/database';
import type { Dependencies } from '../../../dependencies.js';
import { getUserByIdQuery } from '../../account/queries/get-user.js';
import { createSendEmail } from '../../account/services/email.js';

interface SendEducatorContentRejectedEmailParams {
  title: string;
  userId: string;
}

export const createSendEducatorContentRejectedEmail = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async ({
    title,
    userId,
  }: SendEducatorContentRejectedEmailParams): Promise<void> => {
    const { postgres, config } = dependencies;
    try {
      const userInfo = await postgres
        .exec(getUserByIdQuery(userId))
        .then(firstRow);
      const userEmail = userInfo?.email;
      const userHasValidatedEmail = userInfo?.currentEmailChecked;

      if (!userEmail || !userHasValidatedEmail) {
        return;
      }

      const sendEmail = createSendEmail({ config });
      const subject = 'Your educator content has been rejected';

      await sendEmail({
        data: {
          title: title,
          subject: subject,
        },
        email: userEmail,
        subject: subject,
        template: 'd-bb9db36e39d54e18853e4377400b81cd',
      });
    } catch (error) {
      console.error(
        `Error sending educator content rejected email for content "${title}" to user ${userId}:`,
        error,
      );
    }
  };
};
