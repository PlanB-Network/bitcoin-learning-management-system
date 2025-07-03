import { firstRow, sql } from '@blms/database';
import type { Lab, LabSession } from '@blms/types';
import type { Dependencies } from '../../dependencies.js';

export const createGetLab = ({ postgres }: Dependencies) => {
  return async ({ group }: { group: string }) => {
    const lab = await postgres.exec(getLabQuery({ group })).then(firstRow);

    if (!lab) {
      return { lab: null, sessions: [] };
    }

    const sessions = await postgres.exec(
      getLabSessionsQuery({ labId: lab.id }),
    );

    return { lab: lab, sessions: sessions };
  };
};

export const getLabQuery = ({ group }: { group: string }) => {
  return sql<Lab[]>`
  SELECT *
  FROM content.labs
  WHERE study_group = ${group}`;
};

export const getLabSessionsQuery = ({ labId }: { labId: string }) => {
  return sql<LabSession[]>`
  SELECT *
  FROM content.labs_sessions
  WHERE lab_id = ${labId}
  ORDER BY start_date DESC
  `;
};
