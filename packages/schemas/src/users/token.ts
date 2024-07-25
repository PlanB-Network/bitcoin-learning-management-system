import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { token, tokenTypeEnum } from '@blms/database';

export const tokenSchema = createSelectSchema(token);

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const tokenTypeSchema = z.enum(tokenTypeEnum.enumValues);
