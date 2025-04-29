import { firstRow } from '@blms/database';
import type { Dependencies } from '../../../dependencies.js';
import { getUserByIdQuery } from '../../account/queries/get-user.js';
import { createSendEmail } from '../../account/services/email.js';
import { getCourseInfo, getCourseLocalized } from '../queries/get-course.js';
import { updateCourseCoupon } from '../queries/update-course-coupon.js';
import {
  updateCoursePaymentQuery,
  updatePaymentInvoiceId,
} from '../queries/update-payment.js';

type Options = { id: string } & (
  | { isPaid: true; isExpired: false }
  | { isPaid: false; isExpired: true }
);

export const createUpdateCoursePayment = ({
  postgres,
  config,
}: Dependencies) => {
  return async (options: Options) => {
    const coursePayment = await postgres.exec(
      updateCoursePaymentQuery(options),
    );

    if (options.isPaid) {
      await postgres.exec(updateCourseCoupon({ paymentId: options.id }));
    }

    // Send email to user if course payment is validated and course is teacher-led
    if (options.isPaid && coursePayment && coursePayment.length === 1) {
      const courseId = coursePayment[0].courseId;

      const courseInfo = await postgres
        .exec(getCourseInfo(courseId))
        .then(firstRow);

      const userInfo = await postgres
        .exec(getUserByIdQuery(coursePayment[0].uid))
        .then(firstRow);
      const userEmail = userInfo?.email;

      if (
        courseInfo &&
        courseInfo.teachingFormat === 'professor_led' &&
        courseInfo.isPlanbSchool &&
        userEmail
      ) {
        const courseLocalized = await postgres
          .exec(getCourseLocalized('en', courseId))
          .then(firstRow);

        if (courseLocalized) {
          const sendEmail = createSendEmail({ config });

          const courseName = courseLocalized.name;

          await sendEmail({
            email: userEmail,
            subject: `Welcome to ${courseName}`,
            template: 'd-fe44ab001b384d40b83090c288f5d3fe',
            data: {
              courseName: courseName,
            },
          });
        }
      }
    }

    return coursePayment && coursePayment.length === 1
      ? coursePayment[0]
      : null;
  };
};

interface Options2 {
  intentId: string;
  stripeInvoiceId: string;
  invoiceUrl: string;
}

export const createUpdateCoursePaymentInvoiceId = ({
  postgres,
}: Dependencies) => {
  return async (options: Options2) => {
    const coursePayments = await postgres.exec(updatePaymentInvoiceId(options));
    return coursePayments && coursePayments.length === 1
      ? coursePayments[0]
      : null;
  };
};
