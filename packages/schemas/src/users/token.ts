import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { token, tokenTypeEnum } from '@blms/database';

export const tokenTypeSchema = z.enum(tokenTypeEnum.enumValues);

export const tokenSchema = createSelectSchema(token);
