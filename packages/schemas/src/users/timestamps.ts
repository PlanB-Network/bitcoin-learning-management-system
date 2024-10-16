import { createSelectSchema } from 'drizzle-zod';

import { userExamTimestamps } from '@blms/database';

export const userExamTimestampSchema = createSelectSchema(userExamTimestamps);
