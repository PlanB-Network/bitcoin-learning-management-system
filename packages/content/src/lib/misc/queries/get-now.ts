import { sql } from '@sovereign-university/database';

export default interface SelectNow {
  now: number;
}

export const getNowQuery = () => {
  return sql<SelectNow[]>`
      SELECT NOW()
    `;
};
