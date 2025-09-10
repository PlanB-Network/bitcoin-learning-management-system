import type { Dependencies } from '../../../dependencies.js';
import { createSendEmail } from '../../account/services/email.js';

interface SendMonthlySummaryEmailParams {
  courseName: string;
  coordinators: { email: string; displayName: string }[];
  newStudentsCount: number;
  newGraduatedStudentsCount: number;
  newReviewsCount: number;
  averageRating: string;
}

export const createSendSelfPacedCourseMonthlySummaryEmail = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async ({
    courseName,
    coordinators,
    newStudentsCount,
    newGraduatedStudentsCount,
    newReviewsCount,
    averageRating,
  }: SendMonthlySummaryEmailParams): Promise<void> => {
    const { config } = dependencies;
    try {
      if (!coordinators || coordinators.length === 0) {
        console.error(
          `No coordinators found when sending monthly summary for course ${courseName}`,
        );
        return;
      }

      console.log(
        `Sending monthly summary for self learning course ${courseName} to coordinators: ${coordinators
          .map((c) => c.email)
          .join(', ')}`,
      );

      const sendEmail = createSendEmail({ config });

      for (const coordinator of coordinators) {
        const subject = `${process.env.PLANB_ENVIRONMENT !== 'mainnet' ? '[TEST] - ' : ''}${courseName} - Monthly summary`;
        await sendEmail({
          data: {
            courseName: courseName,
            dashboardLink: `${config.domainUrl}/dashboard/my-courses/`,
            newStudentsCount: newStudentsCount,
            newGraduatedStudentsCount: newGraduatedStudentsCount,
            newReviewsCount: newReviewsCount,
            averageRating: averageRating,
            subject: subject,
            teacherName: coordinator.displayName,
          },
          email: coordinator.email,
          subject: subject,
          template: 'd-bdaa9f7d08e542a7a4db055551aaa6cb',
        });
      }
    } catch (error) {
      console.error(
        `Error sending monthly summary to course coordinator for ${courseName}:`,
        error,
      );
    }
  };
};
