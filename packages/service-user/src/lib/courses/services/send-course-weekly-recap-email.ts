import type { JoinedCourse, JoinedCourseChapter } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { getUsersAccountSettingsQuery } from '../../account/queries/get-account-settings.js';
import { getUsersByIdsQuery } from '../../account/queries/get-user.js';
import { createSendEmail } from '../../account/services/email.js';

interface SendWeeklyRecapEmailParams {
  uids: string[];
  course: JoinedCourse;
  courseChapters: JoinedCourseChapter[];
  startDate: Date;
  endDate: Date;
}

export const createSendCourseWeeklyRecapEmail = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async ({
    uids,
    course,
    courseChapters,
    startDate,
    endDate,
  }: SendWeeklyRecapEmailParams): Promise<void> => {
    const { postgres, config } = dependencies;
    try {
      const [usersInfos, usersAccountSettings] = await Promise.all([
        postgres.exec(getUsersByIdsQuery(uids)),
        postgres.exec(getUsersAccountSettingsQuery(uids)),
      ]);

      if (!usersInfos || usersInfos.length === 0) {
        console.error(
          `No users found when sending weekly recap for course ${course.id}`,
        );
        return;
      }

      const userSettingsMap = new Map(
        usersAccountSettings.map((setting) => [setting.uid, setting]),
      );

      const eligibleUsers = [];
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
          `No eligible users found for weekly recap of course ${course.id}`,
        );
        return;
      }

      for (const user of eligibleUsers) {
        const userEmail = user.email;
        const unsubscribeId = user.unsubscribeId;

        const sendEmail = createSendEmail({ config });

        const courseName = course.name;
        const subject = `${process.env.PLANB_ENVIRONMENT !== 'mainnet' ? '[TEST] - ' : ''}${courseName} - Weekly recap`;
        const upcomingChapters = courseChapters.map((chapter) => ({
          chapterIndex: `${chapter.partIndex}.${chapter.chapterIndex}`,
          chapterName: chapter.title,
          chapterStartDate: chapter.startDate?.toISOString(),
          chapterEndDate: chapter.endDate?.toISOString(),
          addressLine1: chapter.addressLine1,
          addressLine2: chapter.addressLine2,
          addressLine3: chapter.addressLine3,
        }));
        const weekEndDate = new Date(endDate);
        weekEndDate.setDate(weekEndDate.getDate() - 1);

        await sendEmail({
          email: userEmail,
          subject: subject,
          template: 'd-014c159979d543ecb8d6657b0265a84c',
          data: {
            courseName: courseName,
            startDate: startDate.toISOString(),
            endDate: weekEndDate.toISOString(),
            upcomingChapters: upcomingChapters,
            dashboardLink: `${config.domainUrl}/dashboard/course/${course.id}`,
            unsubscribeLink: `${config.domainUrl}/change-email-preferences/${unsubscribeId}`,
            subject: subject,
          },
        });
      }
    } catch (error) {
      console.error(
        `Error sending weekly recap for course ${course.id}:`,
        error,
      );
    }
  };
};
