import { createSelectSchema } from 'drizzle-zod';

import { usersFiles } from '@sovereign-university/database/schemas';

export const userFileSchema = createSelectSchema(usersFiles);
