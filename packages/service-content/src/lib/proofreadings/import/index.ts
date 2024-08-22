import { sql } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';

export const createDeleteProofreadings = ({ postgres }: Dependencies) => {
  return async (errors: string[]) => {
    try {
      await postgres.exec(sql`DELETE FROM content.proofreading_contributor`);
      await postgres.exec(sql`DELETE FROM content.proofreading`);
    } catch (error) {
      errors.push(`Error deleting proofreadings : ${error}`);
    }
  };
};
