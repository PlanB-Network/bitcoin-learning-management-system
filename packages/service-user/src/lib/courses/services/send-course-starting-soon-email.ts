import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import { getUsersAccountSettingsQuery } from '../../account/queries/get-account-settings.js';
import { getUsersByIdsQuery } from '../../account/queries/get-user.js';
import { createSendEmail } from '../../account/services/email.js';
import { getCourseLocalized } from '../queries/get-course.js';

interface SendStartingSoonEmailParams {
  uids: string[];
  courseId: string;
  chapterId: string;
}

interface EligibleUser {
  email: string;
  unsubscribeId: string;
}

export const createSendCourseStartingSoonEmail = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async ({
    uids,
    courseId,
    chapterId,
  }: SendStartingSoonEmailParams): Promise<void> => {
    const { postgres, config } = dependencies;

    try {
      const course = await getCourseLocalized('en', courseId).then(firstRow);

      if (!course) {
        console.error(`No course found with ID: ${courseId}`);
        return;
      }

      const [usersInfos, usersAccountSettings] = await Promise.all([
        postgres.exec(getUsersByIdsQuery(uids)),
        postgres.exec(getUsersAccountSettingsQuery(uids)),
      ]);

      if (!usersInfos || usersInfos.length === 0) {
        console.error(
          `No user information found for UIDs associated with course ID: ${courseId}`,
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
          `No eligible users (validated email + notification settings) found for course ID: ${courseId}`,
        );
        return;
      }

      const sendEmail = createSendEmail({ config });
      const courseName = course.name;
      const subject = `${process.env.PLANB_ENVIRONMENT !== 'mainnet' ? '[TEST] - ' : ''}${courseName} - Class starting soon`;
      const joinClassLink = `${config.domainUrl}/courses/${courseId}/${chapterId}`;

      for (const user of eligibleUsers) {
        const unsubscribeLink = `${config.domainUrl}/change-email-preferences/${user.unsubscribeId}`;

        try {
          await sendEmail({
            data: {
              courseName: courseName,
              joinClassLink: joinClassLink,
              subject: subject,
              unsubscribeLink: unsubscribeLink,
            },
            email: user.email,
            subject: subject,
            template: 'd-d1bdb6bbffdf40be903b8d7cde8b9c2d',
          });
        } catch (emailError) {
          console.error(
            `Failed to send email to ${user.email} for course starting soon ${courseId}:`,
            emailError,
          );
        }
      }
      console.log(
        `Finished sending announcement emails for course starting soon ${courseId}.`,
      );
    } catch (error) {
      console.error(
        `Critical error processing course starting soon email for course ${courseId}:`,
        error,
      );
    }
  };
};
