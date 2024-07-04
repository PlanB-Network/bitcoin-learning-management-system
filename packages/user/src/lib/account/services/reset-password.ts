import { TRPCError } from '@trpc/server';
import { hash } from 'argon2';

import {
  EmptyResultError,
  firstRow,
  rejectOnEmpty,
} from '@sovereign-university/database';

import type { Dependencies } from '../../../dependencies.js';
import { changePasswordQuery } from '../queries/change-password.js';
import { getUserByEmailQuery } from '../queries/get-user.js';
import { consumeTokenQuery, createTokenQuery } from '../queries/token.js';

import { createSendEmail } from './email.js';

export const createPasswordResetToken = (deps: Dependencies) => {
  const template = deps.config.sendgrid.templates.resetPassword;
  const domainUrl = deps.config.domainUrl;

  if (!template) {
    throw new Error('Missing reset password template');
  }

  const sendEmail = createSendEmail(deps);

  return (email: string) => {
    return deps.postgres
      .exec(getUserByEmailQuery(email))
      .then(firstRow)
      .then(rejectOnEmpty)
      // .then(({ uid, email }) =>
      //   deps.postgres.exec(
      //     createTokenQuery(uid, 'reset_password' satisfies TokenType, email),
      //   ),
      // )
      .then(({ uid, email }) =>
        deps.postgres.exec(createTokenQuery(uid, 'reset_password', email)),
      )
      .then(firstRow)
      .then(rejectOnEmpty)
      .then((token) =>
        sendEmail({
          email,
          subject: 'Reset your password',
          template,
          data: {
            token_url: `${domainUrl}/reset-password/${token.id}`,
          },
        }),
      )
      .then(() => ({ success: true }))
      .catch((error) => {
        console.error('Error sending email:', error);

        // Do not expose whether email exists or not
        if (error instanceof EmptyResultError) {
          return { success: true };
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send email',
        });
      });
  };
};

/**
 * Factory for changing user's password
 *
 * Validates the provided token and changes the user's password if valid
 */
export const createPasswordReset = ({ postgres }: Dependencies) => {
  return (tokenId: string, newPassword: string) => {
    return Promise.all([
      postgres
        .exec(consumeTokenQuery(tokenId, 'reset_password'))
        .then(firstRow)
        .then(rejectOnEmpty),
      hash(newPassword),
    ])
      .then(([{ uid }, hash]) => postgres.exec(changePasswordQuery(uid, hash)))
      .then(() => ({ success: true }))
      .catch((error) => {
        if (error instanceof EmptyResultError) {
          return { error: "Token doesn't exist or expired" };
        }

        console.error('Error changing password:', error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password',
        });
      });
  };
};
