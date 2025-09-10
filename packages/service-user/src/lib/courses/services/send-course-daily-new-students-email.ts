import type { Dependencies } from '../../../dependencies.js';
import { createSendEmail } from '../../account/services/email.js';

interface SendDailyRecapEmailParams {
  courseName: string;
  coordinators: { email: string; displayName: string }[];
  newStudentsCount: number;
}

export const createSendCoordinatorNewStudentsDailyRecapEmail = (
  dependencies: Pick<Dependencies, 'postgres' | 'config'>,
) => {
  return async ({
    courseName,
    coordinators,
    newStudentsCount,
  }: SendDailyRecapEmailParams): Promise<void> => {
    const { config } = dependencies;
    try {
      if (!coordinators || coordinators.length === 0) {
        console.error(
          `No coordinators found when sending daily recap for new students in course ${courseName}`,
        );
        return;
      }

      console.log(
        `Sending daily recap for new students in course ${courseName} to coordinators: ${coordinators
          .map((c) => c.email)
          .join(', ')}`,
      );

      const sendEmail = createSendEmail({ config });

      for (const coordinator of coordinators) {
        const subject = `${process.env.PLANB_ENVIRONMENT !== 'mainnet' ? '[TEST] - ' : ''}${courseName} - New registrations today`;
        await sendEmail({
          data: {
            courseName: courseName,
            dashboardLink: `${config.domainUrl}/dashboard/my-courses/`,
            newStudentsCount: newStudentsCount,
            subject: subject,
            teacherName: coordinator.displayName,
          },
          email: coordinator.email,
          subject: subject,
          template: 'd-f69422337cd5498dac6ee773a9540581',
        });
      }
    } catch (error) {
      console.error(
        `Error sending daily recap to course coordinator for new enrolled students in course ${courseName}:`,
        error,
      );
    }
  };
};
