import { TRPCError } from '@trpc/server';

import {
  EmptyResultError,
  firstRow,
  rejectOnEmpty,
} from '@sovereign-university/database';
import type { TokenType } from '@sovereign-university/types';

import type { Dependencies } from '#src/dependencies.js';

import {
  changeEmailQuery,
  consumeTokenQuery,
  createTokenQuery,
} from '../queries/index.js';

import { createSendEmail } from './email.js';

/**
 * Factory for changing user's email
 *
 * Validates the provided token and changes the email if the token is valid
 */
export const createChangeEmailConfirmation = ({ postgres }: Dependencies) => {
  return (tokenId: string) => {
    return postgres
      .exec(consumeTokenQuery(tokenId, 'validate_email' satisfies TokenType))
      .then(firstRow)
      .then(rejectOnEmpty)
      .then((token) =>
        postgres.exec(changeEmailQuery(token.uid, token.data as string)),
      )
      .then(firstRow)
      .then(rejectOnEmpty)
      .catch((error) => {
        if (error instanceof EmptyResultError) {
          return { error: "Token doesn't exist or expired", email: null };
        }

        console.error('Error changing email:', error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change email',
        });
      });
  };
};

/**
 * Factory to generate a token to validate email change
 *
 * This token is sent to the user's new email address
 */
export const createEmailValidationToken = (deps: Dependencies) => {
  const template = deps.config.sendgrid.templates.emailChange;
  const domain = deps.config.domainUrl;

  if (!template) {
    throw new Error('Missing SendGrid email change template');
  }

  const sendEmail = createSendEmail(deps);

  return (uid: string, email: string) => {
    return deps.postgres
      .exec(createTokenQuery(uid, 'validate_email', email))
      .then(firstRow)
      .then(rejectOnEmpty)
      .then((token) =>
        sendEmail({
          email,
          subject: 'Validate your email',
          template,
          data: {
            token_url: `${domain}/validate-email/${token.id}`,
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
