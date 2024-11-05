import { sql } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';

const getEventListQuery = () => {
  return sql<Array<{ id: string }>>`SELECT id FROM content.events`;
};

export const createGetEventList = ({ postgres }: Dependencies) => {
  return () => {
    return postgres
      .exec(getEventListQuery())
      .then((rows) => rows.map((row) => row.id));
  };
};
