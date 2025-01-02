import { sql } from '@blms/database';

export const updateCourseCoupon = ({ paymentId }: { paymentId: string }) => {
  return sql`
    UPDATE content.coupon_code
    SET is_used = true
    FROM users.course_payment
    WHERE
      content.coupon_code.is_unique = true AND
      content.coupon_code.code = users.course_payment.coupon_code AND
      users.course_payment.coupon_code IS NOT NULL AND
      users.course_payment.payment_id = ${paymentId}
  ;
    `;
};
