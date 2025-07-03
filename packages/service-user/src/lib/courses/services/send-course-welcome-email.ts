import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import { getUserByIdQuery } from '../../account/queries/get-user.js';
import { createSendEmail } from '../../account/services/email.js';
import { getCourseInfo, getCourseLocalized } from '../queries/get-course.js';

interface SendWelcomeEmailParams {
  courseId: string;
  userId: string;
}

export const createSendCourseWelcomeEmail = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async ({
    courseId,
    userId,
  }: SendWelcomeEmailParams): Promise<void> => {
    const { postgres, config } = dependencies;
    try {
      const courseInfo = await postgres
        .exec(getCourseInfo(courseId))
        .then(firstRow);

      if (!courseInfo || !courseInfo.isPlanbSchool) {
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

      const courseLocalized = await postgres
        .exec(getCourseLocalized('en', courseId))
        .then(firstRow);

      if (!courseLocalized) {
        return;
      }

      const sendEmail = createSendEmail({ config });
      const courseName = courseLocalized.name;
      const subject = `${process.env.PLANB_ENVIRONMENT !== 'mainnet' ? '[TEST] - ' : ''}Welcome to ${courseName}`;

      await sendEmail({
        data: {
          courseName: courseName,
          dashboardLink: `${config.domainUrl}/dashboard/course/${courseId}`,
          subject: subject,
        },
        email: userEmail,
        subject: subject,
        template: 'd-fe44ab001b384d40b83090c288f5d3fe',
      });
    } catch (error) {
      console.error(
        `Error sending welcome email for course ${courseId} to user ${userId}:`,
        error,
      );
    }
  };
};
