import { TokenType } from '@blms/constants';
import { token } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const tokenTypeSchema = z.nativeEnum(TokenType);

export const tokenSchema = createSelectSchema(token);
