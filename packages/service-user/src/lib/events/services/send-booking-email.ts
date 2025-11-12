import { firstRow } from '@blms/database';
import type { Dependencies } from '../../../dependencies.js';
import { getUserByIdQuery } from '../../account/queries/get-user.js';
import { createSendEmail } from '../../account/services/email.js';
import { getEventMinimalInfoQuery } from '../queries/get-event-info.js';

interface SendEventBookingEmailParams {
  eventId: string;
  userId: string;
}

export const createSendEventBookingEmail = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async ({
    eventId,
    userId,
  }: SendEventBookingEmailParams): Promise<void> => {
    const { postgres, config } = dependencies;
    try {
      console.log(
        `Sending confirmed booking email for event ${eventId} to user ${userId}`,
      );

      const eventInfo = await postgres
        .exec(getEventMinimalInfoQuery(eventId))
        .then(firstRow);

      if (!eventInfo) {
        return;
      }

      const userInfo = await postgres
        .exec(getUserByIdQuery(userId))
        .then(firstRow);
      const userEmail = userInfo?.email;
      const userHasValidatedEmail = userInfo?.currentEmailChecked;

      if (!userEmail || !userHasValidatedEmail) {
        return;
      }

      const sendEmail = createSendEmail({ config });
      const eventName = eventInfo.name;
      const eventDate = eventInfo.startDate;
      const subject = `Thank you, your booking for ${eventName} is confirmed!`;

      await sendEmail({
        data: {
          eventDate: eventDate,
          eventName: eventName,
          ticketDownloadLink: `${config.domainUrl}/events/my-tickets`,
          subject: subject,
        },
        email: userEmail,
        subject: subject,
        template: 'd-b0eb6c5239b34b5884b91654f4cd2ac2',
      });
    } catch (error) {
      console.error(
        `Error sending confirmed booking email for event ${eventId} to user ${userId}:`,
        error,
      );
    }
  };
};
