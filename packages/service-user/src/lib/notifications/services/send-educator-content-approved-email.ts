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
      const subject = `Your content "${title}" has been approved!`;

      await sendEmail({
        data: {
          title: title,
          link: `${config.domainUrl}/${language}/educator-content`,
          subject: subject,
        },
        email: userEmail,
        subject: subject,
        // TODO: Replace with actual SendGrid template ID for "Educator Content Approved"
        template: 'd-placeholder-educator-content-approved',
      });
    } catch (error) {
      console.error(
        `Error sending educator content approved email for content "${title}" to user ${userId}:`,
        error,
      );
    }
  };
};
