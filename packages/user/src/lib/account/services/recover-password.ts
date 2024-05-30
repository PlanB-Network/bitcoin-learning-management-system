import { firstRow, rejectOnEmpty } from '@sovereign-university/database';
import type { Dependencies } from '../../../dependencies.js';
import { createTokenQuery } from '../queries/token.js';

import { createSendEmail } from './email.js';
import { TRPCError } from '@trpc/server';
import { getUserByEmailQuery } from '../queries/get-user.js';

export const createPasswordRecoveryToken = (deps: Dependencies) => {
  const template = deps.config.sendgrid.templates.recoverPassword;
  const domain = deps.config.domain;

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
        deps.postgres.exec(createTokenQuery(uid, 'validate_email', email)),
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
      .catch((err) => {
        console.error('Error sending email:', err);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send email',
        });
      });
  };
};
