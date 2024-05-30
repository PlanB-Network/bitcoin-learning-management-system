import { createSelectSchema } from 'drizzle-zod';

import { token, tokenTypeEnum } from '@sovereign-university/database/schemas';
import { z } from 'zod';

export const tokenSchema = createSelectSchema(token);
export const tokenTypeSchema = z.enum(tokenTypeEnum.enumValues);
