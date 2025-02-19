import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { TokenType } from '@blms/constants';
import { token } from '@blms/database';

export const tokenTypeSchema = z.nativeEnum(TokenType);

export const tokenSchema = createSelectSchema(token);
