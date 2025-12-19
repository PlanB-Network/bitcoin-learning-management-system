import type { Dependencies } from '../../../dependencies.js';
import { getEducatorContentAdminEmailsQuery } from '../../account/queries/get-emails.js';
import { createSendEmail } from '../../account/services/email.js';

interface ContentItem {
  title: string;
  authorName: string;
}

interface SendEducatorContentDigestEmailParams {
  contents: ContentItem[];
}

export const createSendEducatorContentDigestEmail = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async ({
    contents,
  }: SendEducatorContentDigestEmailParams): Promise<void> => {
    const { postgres, config } = dependencies;
    try {
      if (contents.length === 0) {
        return;
      }

      const adminEmails = await postgres.exec(
        getEducatorContentAdminEmailsQuery(),
      );

      if (adminEmails.length === 0) {
        console.log('[educator-content] No admins found to send digest to');
        return;
      }

      const sendEmail = createSendEmail({ config });
      const subject = `${process.env.PLANB_ENVIRONMENT !== 'mainnet' ? '[TEST] - ' : ''}New educator content awaiting review`;

      // Format contents for the email template
      const contentList = contents.map((c) => ({
        title: c.title,
        authorName: c.authorName,
      }));

      for (const { email } of adminEmails) {
        await sendEmail({
          data: {
            contents: contentList,
            reviewLink: `${config.domainUrl}/dashboard/administration/educator-content/toreview`,
            subject: subject,
          },
          email: email,
          subject: subject,
          template: 'd-ad7678aeeb9a42a3aee5a2d7303865c8',
        });
      }

      console.log(
        `[educator-content] Sent digest email with ${contents.length} items to ${adminEmails.length} admins`,
      );
    } catch (error) {
      console.error('Error sending educator content digest email:', error);
    }
  };
};
