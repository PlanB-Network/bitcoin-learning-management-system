import { firstRow } from '@blms/database';
import type { Dependencies } from '../../../dependencies.js';
import { getUserByIdQuery } from '../../account/queries/get-user.js';
import { createSendEmail } from '../../account/services/email.js';

interface SendEducatorContentApprovedEmailParams {
  title: string;
  userId: string;
  language: string;
}

export const createSendEducatorContentApprovedEmail = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async ({
    title,
    userId,
    language,
  }: SendEducatorContentApprovedEmailParams): Promise<void> => {
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
      const subject = `Your educator content -${title}- is live!`;

      await sendEmail({
        data: {
          title: title,
          link: `${config.domainUrl}/${language}/educator-content`,
          subject: subject,
        },
        email: userEmail,
        subject: subject,
        template: 'd-2eed756bce434e0aa6867796d12ef96d',
      });
    } catch (error) {
      console.error(
        `Error sending educator content approved email for content "${title}" to user ${userId}:`,
        error,
      );
    }
  };
};
