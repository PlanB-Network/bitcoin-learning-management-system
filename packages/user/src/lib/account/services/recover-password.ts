import { TRPCError } from '@trpc/server';

import { firstRow, rejectOnEmpty } from '@sovereign-university/database';
import type { TokenType } from '@sovereign-university/types';

import type { Dependencies } from '#src/dependencies.js';

import { getUserByEmailQuery } from '../queries/get-user.js';
import { createTokenQuery } from '../queries/token.js';

import { createSendEmail } from './email.js';

export const createPasswordRecoveryToken = (deps: Dependencies) => {
  const template = deps.config.sendgrid.templates.recoverPassword;
  const domain = deps.config.domainUrl;

  if (!template) {
    throw new Error('Missing recover password template');
  }

  const sendEmail = createSendEmail(deps);

  return (email: string) => {
    return deps.postgres
      .exec(getUserByEmailQuery(email))
      .then(firstRow)
      .then(rejectOnEmpty)
      .then(({ uid, email }) =>
        deps.postgres.exec(
          createTokenQuery(uid, 'reset_password' satisfies TokenType, email),
        ),
      )
      .then(firstRow)
      .then(rejectOnEmpty)
      .then((token) =>
        sendEmail({
          email,
          subject: 'Recover your password',
          template,
          data: {
            token_url: `${domain}/recover-password/${token.id}`,
          },
        }),
      )
      .then(() => ({ success: true }))
      .catch((error) => {
        console.error('Error sending email:', error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send email',
        });
      });
  };
};
