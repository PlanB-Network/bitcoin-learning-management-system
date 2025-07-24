import { loginResponseSchema } from '@blms/schemas';
import {
  createEmailValidationToken,
  createGetUserByUsername,
  createGetUserByUsernameOrEmail,
  createNewCredentialsUser,
} from '@blms/service-user';
import type { LoginResponse, SessionData } from '@blms/types';
import { TRPCError } from '@trpc/server';
import { verify as verifyHash } from 'argon2';
import type { Request } from 'express';
import { z } from 'zod';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';
import { contributorIdSchema } from '../../utils/validators.js';

const loginCredentialsSchema = z.object({
  password: z.string(),
  username: z.string(),
});

const setSession = (req: Request, user: SessionData) => {
  req.session.uid = user.uid;
  req.session.role = user.role;
  req.session.permissions = user.permissions ?? null;
};

export const credentialsAuthRouter = createTRPCRouter({
  login: publicProcedure
    .input(loginCredentialsSchema)
    .output<Parser<LoginResponse>>(loginResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const getUser = createGetUserByUsernameOrEmail(ctx.dependencies);

      // Check if a session exists and if it is valid
      if (ctx.req.session.uid) {
        ctx.log('----- User is already logged in');
        ctx.log('----- Clear user session');
        ctx.req.session.destroy((err: any) => {
          if (err)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to clear session',
            });
        });
      }

      const username = input.username.toLowerCase().trim();

      const user = await getUser(username);

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      if (!user.passwordHash) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This user has no password, try another login method',
        });
      }

      if (!(await verifyHash(user.passwordHash, input.password))) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      setSession(ctx.req, user);

      return {
        message: 'Logged in',
        status: 200,
        user: {
          email: user.email,
          uid: user.uid,
          username: user.username,
        },
      };
    }),
  register: publicProcedure
    .input(
      z.object({
        contributor_id: contributorIdSchema.optional(),
        email: z.string().email().optional().nullable(),
        password: z.string().min(8),
        university: z.string().optional().nullable(),
        username: z.string().min(5),
      }),
    )
    .output<Parser<LoginResponse>>(loginResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const getUser = createGetUserByUsername(ctx.dependencies);

      const username = input.username.toLowerCase().trim();

      if (/[@ ]/i.test(username)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Username can not contain spaces or @ symbol. Please choose another username.',
        });
      }

      // TODO: move this to service once we have the custom errors
      if (await getUser({ username })) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Username already exists',
        });
      }

      const newCredentialsUser = createNewCredentialsUser(ctx.dependencies);
      const user = await newCredentialsUser({
        contributorId: input.contributor_id,
        email: input.email ?? null,
        password: input.password,
        university: input.university ?? null,
        username,
      });

      if (user && input.email) {
        await createEmailValidationToken(ctx.dependencies)(
          user.uid,
          input.email,
        );
      }

      setSession(ctx.req, user);

      return {
        message: 'User created',
        status: 201,
        user: {
          email: user.email,
          uid: user.uid,
          username: user.username,
        },
      };
    }),
});
