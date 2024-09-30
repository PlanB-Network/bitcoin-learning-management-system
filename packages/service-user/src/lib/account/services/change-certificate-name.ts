// TODO: use normal error
import { TRPCError } from '@trpc/server';

import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import { changeCertificateNameQuery } from '../queries/change-certificate-name.js';
import { getUserByIdQuery } from '../queries/get-user.js';

interface Options {
  uid: string;
  certificateName: string;
}

export const createChangeCertificateName = ({ postgres }: Dependencies) => {
  return async ({ uid, certificateName }: Options) => {
    const user = await postgres.exec(getUserByIdQuery(uid)).then(firstRow);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    await postgres.exec(changeCertificateNameQuery(uid, certificateName));
  };
};
