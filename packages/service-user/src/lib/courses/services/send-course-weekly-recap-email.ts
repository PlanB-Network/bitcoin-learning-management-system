import { firstRow } from '@blms/database';

import type { JoinedCourse, JoinedCourseChapter } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { getUserByIdQuery } from '../../account/queries/get-user.js';
import { createSendEmail } from '../../account/services/email.js';

interface SendWeeklyRecapEmailParams {
  userId: string;
  course: JoinedCourse;
  courseChapters: JoinedCourseChapter[];
}

export const createSendCourseWeeklyRecapEmail = (
  dependencies: Dependencies,
) => {
  return async ({
    userId,
    course,
    courseChapters,
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

      const sendEmail = createSendEmail({ config });
      const courseName = course.name;
      const subject = `${process.env.PLANB_ENVIRONMENT !== 'mainnet' ? '[TEST] - ' : ''}${courseName} - Weekly recap`;

      await sendEmail({
        email: userEmail,
        subject: subject,
        template: 'd-014c159979d543ecb8d6657b0265a84c',
        data: {
          courseName: courseName,
          dashboardLink: `${config.domainUrl}/dashboard/courses`,
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
