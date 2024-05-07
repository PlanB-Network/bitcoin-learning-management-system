import { sql } from '@sovereign-university/database';

export const calculateEventSeats = () => {
  return sql`
  UPDATE content.events c 
  SET remaining_seats = c.available_seats - 
    (select count(*) 
    FROM users.user_event 
    WHERE event_id = c.id 
      AND booked = true 
      AND with_physical = true
    ) -
    (select count(*) 
    FROM users.event_payment 
    WHERE event_id = c.id 
      AND payment_status = 'paid' 
      AND with_physical = true
    );
  `;
};
