import { TRPCError } from '@trpc/server';

import { firstRow } from '@blms/database';

import type { Dependencies } from '#src/dependencies.js';

import { getUserByIdQuery } from '../../account/queries/get-user.js';
import {
  deleteLikeTutorialQuery,
  getExistingLikeTutorialQuery,
  insertLikeTutorialQuery,
  updateLikeTutorialQuery,
} from '../queries/like-tutorial.js';

interface Options {
  uid: string;
  id: string;
  liked: boolean;
}

export const createLikeTutorial = ({ postgres }: Dependencies) => {
  return async ({ uid, id, liked }: Options) => {
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
};

export const createGetExistingLikeTutorial = ({ postgres }: Dependencies) => {
  return async ({ uid, id }: { uid: string; id: string }) => {
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

    return existingEntry.length > 0
      ? {
          liked: existingEntry[0].liked as boolean,
          disliked: !existingEntry[0].liked,
        }
      : { liked: false, disliked: false };
  };
};
