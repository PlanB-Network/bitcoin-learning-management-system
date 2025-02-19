import { TRPCError } from '@trpc/server';

import { EmptyResultError, firstRow, rejectOnEmpty, sql } from '@blms/database';
import type { UserAccount } from '@blms/types';

import type { Dependencies } from '#src/dependencies.js';

import { changeEmailWithTokenQuery } from '../queries/change-email.js';
import { createTokenQuery } from '../queries/token.js';

import { TokenType } from '@blms/constants';
import { createSendEmail } from './email.js';

/**
 * Factory for changing user's email
 *
 * Validates the provided token and changes the email if the token is valid
 */
export const createChangeEmailConfirmation = ({ postgres }: Dependencies) => {
  return (tokenId: string) => {
    return postgres
      .exec(changeEmailWithTokenQuery(tokenId))
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
  const { postgres, config } = deps;
  const template = config.sendgrid.templates.emailChange;
  const domain = config.domainUrl;

  if (!template) {
    throw new Error('Missing SendGrid email change template');
  }

  const sendEmail = createSendEmail({ config });

  return async (uid: string, email: string) => {
    // Check last email change request
    const last = await postgres.getOneOrReject(
      sql<
        Array<Pick<UserAccount, 'lastEmailChangeRequest'>>
      >`SELECT last_email_change_request FROM users.accounts WHERE uid = ${uid}`,
    );

    const minTimestamp = Date.now() - 5 * 60 * 1000; // 5 minutes
    if (+(last.lastEmailChangeRequest ?? 0) > minTimestamp) {
      return {
        error: 'emailChangeRateLimitError',
      };
    }

    // Update last email change request timestamp
    await postgres.exec(
      sql`UPDATE users.accounts SET last_email_change_request = NOW() WHERE uid = ${uid}`,
    );

    return postgres
      .getOneOrReject(createTokenQuery(uid, TokenType.ValidateEmail, email))
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
