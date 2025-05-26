import { TRPCError } from '@trpc/server';
import { verify as verifyHash } from 'argon2';
import type { Request } from 'express';
import { z } from 'zod';

import { loginResponseSchema } from '@blms/schemas';
import {
  createEmailValidationToken,
  createGetUserByUsername,
  createNewCredentialsUser,
} from '@blms/service-user';
import type { LoginResponse, SessionData } from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';
import { contributorIdSchema } from '../../utils/validators.js';

const registerCredentialsSchema = z.object({
  username: z.string().min(5),
  password: z.string().min(8),
  email: z.string().email().optional().nullable(),
  contributor_id: contributorIdSchema.optional(),
});

const loginCredentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const setSession = (req: Request, user: SessionData) => {
  req.session.uid = user.uid;
  req.session.role = user.role;
  req.session.permissions = user.permissions ?? null;
};

export const credentialsAuthRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerCredentialsSchema)
    .output<Parser<LoginResponse>>(loginResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const getUser = createGetUserByUsername(ctx.dependencies);

      const username = input.username.toLowerCase().trim();

      if (/[@\ ]/i.test(username)) {
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
        username,
        password: input.password,
        contributorId: input.contributor_id,
        email: input.email ?? null,
      });

      if (user && input.email) {
        await createEmailValidationToken(ctx.dependencies)(
          user.uid,
          input.email,
        );
      }

      setSession(ctx.req, user);

      return {
        status: 201,
        message: 'User created',
        user: {
          uid: user.uid,
          username: user.username,
          email: user.email,
        },
      };
    }),
  login: publicProcedure
    .input(loginCredentialsSchema)
    .output<Parser<LoginResponse>>(loginResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const getUser = createGetUserByUsername(ctx.dependencies);

      // Check if a session exists and if it is valid
      if (ctx.req.session.uid) {
        console.log('----- User is already logged in');
        console.log('----- Clear user session');
        ctx.req.session.destroy((err) => {
          if (err)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to clear session',
            });
        });
      }

      const username = input.username.toLowerCase().trim();

      const user = await getUser({ username });

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
        status: 200,
        message: 'Logged in',
        user: {
          uid: user.uid,
          username: user.username,
          email: user.email,
        },
      };
    }),
});
