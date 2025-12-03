import { firstRow } from '@blms/database';
import type { Dependencies } from '../../../dependencies.js';
import { getEventMinimalInfoQuery } from '../../../lib/events/queries/get-event-info.js';
import { getUsersAccountSettingsQuery } from '../../account/queries/get-account-settings.js';
import { getUsersByIdsQuery } from '../../account/queries/get-user.js';
import { createSendEmail } from '../../account/services/email.js';

interface SendReminderEmailParams {
  uids: string[];
  eventId: string;
}

interface EligibleUser {
  email: string;
  unsubscribeId: string;
}

export const createSendEventReminderEmail = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async ({ uids, eventId }: SendReminderEmailParams): Promise<void> => {
    const { postgres, config } = dependencies;

    try {
      const event = await getEventMinimalInfoQuery(eventId).then(firstRow);
      if (!event) {
        console.error(`No event found with ID: ${eventId}`);
        return;
      }

      const [usersInfos, usersAccountSettings] = await Promise.all([
        postgres.exec(getUsersByIdsQuery(uids)),
        postgres.exec(getUsersAccountSettingsQuery(uids)),
      ]);

      if (!usersInfos || usersInfos.length === 0) {
        console.error(
          `No user information found for UIDs associated with event ID: ${eventId}`,
        );
        return;
      }

      const userSettingsMap = new Map(
        usersAccountSettings.map((setting) => [setting.uid, setting]),
      );

      const eligibleUsers: EligibleUser[] = [];
      for (const userInfo of usersInfos) {
        const userEmail = userInfo.email;
        const userHasValidatedEmail = userInfo.currentEmailChecked;

        if (!userEmail || !userHasValidatedEmail) {
          continue;
        }

        const userAccountSettings = userSettingsMap.get(userInfo.uid);

        if (
          !userAccountSettings ||
          !userAccountSettings.emailNotifyCourses ||
          !userAccountSettings.unsubscribeId
        ) {
          continue;
        }

        eligibleUsers.push({
          email: userEmail,
          unsubscribeId: userAccountSettings.unsubscribeId,
        });
      }

      if (eligibleUsers.length === 0) {
        console.error(
          `No eligible users (validated email + notification settings) found for event ID: ${eventId}`,
        );
        return;
      }

      const sendEmail = createSendEmail({ config });
      const eventName = event.name;
      const subject = `${process.env.PLANB_ENVIRONMENT !== 'mainnet' ? '[TEST] - ' : ''}Event reminder`;

      const timeZone = event.timezone || 'UTC';
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      const dateFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const startDateString = dateFormatter.format(startDate);
      const endDateString = dateFormatter.format(endDate);

      const displayDate =
        startDateString === endDateString
          ? startDateString
          : `${startDateString} - ${endDateString}`;

      const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const startTimeString = timeFormatter.format(startDate);
      const endTimeString = timeFormatter.format(endDate);

      const displayTime = `${startTimeString} - ${endTimeString}`;

      const physicalAddress = [
        event.addressLine3,
        event.addressLine2,
        event.addressLine1,
      ]
        .filter(Boolean)
        .join(', ');

      const displayLocation = event.bookOnline
        ? event.bookInPerson
          ? `${physicalAddress} | Online`
          : 'Online'
        : physicalAddress || 'TBA';

      const eventLink = `${config.domainUrl}/events/${eventId}`;

      for (const user of eligibleUsers) {
        const unsubscribeLink = `${config.domainUrl}/change-email-preferences/${user.unsubscribeId}`;

        try {
          await sendEmail({
            data: {
              eventName: eventName,
              eventDate: displayDate,
              eventTime: displayTime,
              eventLink: eventLink,
              eventLocation: displayLocation,
              myTicketsLink: `${config.domainUrl}/events/my-tickets`,
              subject: subject,
              unsubscribeLink: unsubscribeLink,
            },
            email: user.email,
            subject: subject,
            template: 'd-bea434e96ae2491689f591b363757c4e',
          });
        } catch (emailError) {
          console.error(
            `Failed to send reminder email to ${user.email} for event ${eventId}:`,
            emailError,
          );
        }
      }
      console.log(`Finished sending reminder emails for event ${eventId}.`);
    } catch (error) {
      console.error(
        `Critical error processing reminder email for event ${eventId}:`,
        error,
      );
    }
  };
};
