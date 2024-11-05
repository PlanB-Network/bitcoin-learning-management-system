import { sql } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';

interface Options {
  eventId: string;
}

const getEventUsersQuery = ({ eventId }: Options) => {
  return sql<Array<{ email: string; username: string }>>`
    SELECT a.username, a.email
    FROM users.user_event ue
    LEFT JOIN users.accounts a ON ue.uid = a.uid
    WHERE ue.event_id = ${eventId}
    `;
};

export const createGetEventUsers = ({ postgres }: Dependencies) => {
  return ({ eventId }: Options) => {
    return postgres.exec(getEventUsersQuery({ eventId }));
  };
};
