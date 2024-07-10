import { createSelectSchema } from 'drizzle-zod';

import { usersFiles } from '@sovereign-university/database';

export const userFileSchema = createSelectSchema(usersFiles);
