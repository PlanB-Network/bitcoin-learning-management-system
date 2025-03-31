import { sql } from '@blms/database';

export const updateEventCoupon = ({ paymentId }: { paymentId: string }) => {
  return sql`
    UPDATE content.coupon_code
    SET uses = uses + 1
    FROM users.event_payment
    WHERE
      content.coupon_code.deleted_at IS NULL AND
      content.coupon_code.code = users.event_payment.coupon_code AND
      users.event_payment.coupon_code IS NOT NULL AND
      users.event_payment.payment_id = ${paymentId}
  ;
    `;
};
