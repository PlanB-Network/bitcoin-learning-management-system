import { sql } from '@blms/database';

export const getEventMinimalInfoQuery = (id: string) => {
  return sql<
    {
      name: string;
      startDate: string;
      endDate: string;
      timezone: string;
      bookInPerson: boolean;
      bookOnline: boolean;
      addressLine1: string;
      addressLine2: string;
      addressLine3: string;
    }[]
  >`
    SELECT
      e.name,
      e.start_date,
      e.end_date,
      e.timezone,
      e.book_in_person,
      e.book_online,
      e.address_line_1,
      e.address_line_2,
      e.address_line_3
    FROM content.events e
    WHERE e.id = ${id}
  `;
};
