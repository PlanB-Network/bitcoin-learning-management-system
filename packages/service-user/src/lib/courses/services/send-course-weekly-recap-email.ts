import { firstRow } from '@blms/database';

import type { JoinedCourse, JoinedCourseChapter } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { getUserAccountSettingsQuery } from '../../account/queries/get-account-settings.js';
import { getUserByIdQuery } from '../../account/queries/get-user.js';
import { createSendEmail } from '../../account/services/email.js';

interface SendWeeklyRecapEmailParams {
  userId: string;
  course: JoinedCourse;
  courseChapters: JoinedCourseChapter[];
  startDate: Date;
  endDate: Date;
}

export const createSendCourseWeeklyRecapEmail = (
  dependencies: Dependencies,
) => {
  return async ({
    userId,
    course,
    courseChapters,
    startDate,
    endDate,
  }: SendWeeklyRecapEmailParams): Promise<void> => {
    const { postgres, config } = dependencies;
    try {
      const userInfo = await postgres
        .exec(getUserByIdQuery(userId))
        .then(firstRow);
      const userEmail = userInfo?.email;

      if (!userEmail) {
        return;
      }

      const userAccountSettings = await postgres
        .exec(getUserAccountSettingsQuery(userId))
        .then(firstRow);
      const acceptsCourseEmail = userAccountSettings?.emailNotifyCourses;
      const unsubscribeId = userAccountSettings?.unsubscribeId;

      if (!acceptsCourseEmail || !unsubscribeId) {
        return;
      }

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
          dashboardLink: `${config.domainUrl}/dashboard/courses`,
          unsubscribeLink: `${config.domainUrl}/change-email-preferences/${unsubscribeId}`,
          subject: subject,
        },
      });
    } catch (error) {
      console.error(
        `Error sending weekly recap for course ${course.id} to user ${userId}:`,
        error,
      );
    }
  };
};
