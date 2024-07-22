import { TRPCError } from '@trpc/server';

import { firstRow } from '@blms/database';

import type { Dependencies } from '#src/dependencies.js';

import { getUserByIdQuery } from '../../account/queries/get-user.js';
import {
  deleteLikeTutorialQuery,
  getExistingLikeTutorialQuery,
  insertLikeTutorialQuery,
  updateLikeTutorialQuery,
} from '../queries/index.js';

interface Options {
  uid: string;
  id: number;
  liked: boolean;
}

export const createLikeTutorial =
  (dependencies: Dependencies) =>
  async ({ uid, id, liked }: Options) => {
    const { postgres } = dependencies;

    const user = await postgres.exec(getUserByIdQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    const existingEntry = await postgres.exec(
      getExistingLikeTutorialQuery(uid, id),
    );

    existingEntry.length > 0
      ? existingEntry[0].liked === liked
        ? await postgres.exec(deleteLikeTutorialQuery(uid, id))
        : await postgres.exec(updateLikeTutorialQuery(uid, id, liked))
      : await postgres.exec(insertLikeTutorialQuery(uid, id, liked));
  };
