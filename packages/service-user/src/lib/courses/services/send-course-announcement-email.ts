import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import { getUsersAccountSettingsQuery } from '../../account/queries/get-account-settings.js';
import { getUsersByIdsQuery } from '../../account/queries/get-user.js';
import { createSendEmail } from '../../account/services/email.js';
import { getPublishedScheduledCourseAnnouncementByIdQuery } from '../../notifications/queries/get-scheduled-course-announcement.js';
import { createUserNotificationsService } from '../../notifications/services/user-notifications-service.js';
import { getCourseLocalized } from '../queries/get-course.js';

interface SendAnnouncementEmailParams {
  announcementId: string;
}

interface EligibleUser {
  email: string;
  unsubscribeId: string;
}

export const createSendCourseAnnouncementEmail = (
  dependencies: Dependencies,
) => {
  return async ({
    announcementId,
  }: SendAnnouncementEmailParams): Promise<void> => {
    const { postgres, config } = dependencies;
    const userNotificationsService =
      await createUserNotificationsService(dependencies);

    try {
      const announcementInfo = await postgres
        .exec(
          getPublishedScheduledCourseAnnouncementByIdQuery({
            announcementId,
          }),
        )
        .then(firstRow);

      if (!announcementInfo) {
        console.error(
          `No scheduled course announcement found with ID: ${announcementId}`,
        );
        return;
      }

      const course = await getCourseLocalized(
        'en',
        announcementInfo.courseId,
      ).then(firstRow);

      if (!course) {
        console.error(`No course found with ID: ${announcementInfo.courseId}`);
        return;
      }

      // TODO: handle summer school selected students
      const uidsSubscribedToCourse =
        await userNotificationsService.getUidsByCourse(
          course.courseId,
          false,
          announcementInfo.studentGroup === 'assignment',
        );

      if (!uidsSubscribedToCourse || uidsSubscribedToCourse.length === 0) {
        console.error(
          `No users subscribed to course ID: ${announcementInfo.courseId}`,
        );
        return;
      }

      const [usersInfos, usersAccountSettings] = await Promise.all([
        postgres.exec(getUsersByIdsQuery(uidsSubscribedToCourse)),
        postgres.exec(getUsersAccountSettingsQuery(uidsSubscribedToCourse)),
      ]);

      if (!usersInfos || usersInfos.length === 0) {
        console.error(
          `No user information found for UIDs associated with course ID: ${announcementInfo.courseId}`,
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
          `No eligible users (validated email + notification settings) found for course ID: ${announcementInfo.courseId}`,
        );
        return;
      }

      const sendEmail = createSendEmail({ config });
      const courseName = course.name;
      const courseId = course.courseId;
      const subject = `${process.env.PLANB_ENVIRONMENT !== 'mainnet' ? '[TEST] - ' : ''}${courseName} - Special announcement`;
      const announcementText = announcementInfo.content
        .split('\n')
        .map((line) => line.trim() || ' '); // non breaking space for empty lines
      const dashboardLink = `${config.domainUrl}/dashboard/course/${courseId}`;

      for (const user of eligibleUsers) {
        const unsubscribeLink = `${config.domainUrl}/change-email-preferences/${user.unsubscribeId}`;

        try {
          await sendEmail({
            email: user.email,
            subject: subject,
            template: 'd-7510966cbc5e48cc9746cbbd93256d9a',
            data: {
              courseName: courseName,
              announcementText: announcementText,
              dashboardLink: dashboardLink,
              unsubscribeLink: unsubscribeLink,
              subject: subject,
            },
          });
        } catch (emailError) {
          console.error(
            `Failed to send email to ${user.email} for announcement ${announcementId}:`,
            emailError,
          );
        }
      }
      console.log(
        `Finished sending announcement emails for announcement ${announcementId}.`,
      );
    } catch (error) {
      console.error(
        `Critical error processing announcement ${announcementId}:`,
        error,
      );
    }
  };
};
