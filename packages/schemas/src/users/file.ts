import { createSelectSchema } from 'drizzle-zod';

import { usersFiles } from '@blms/database';

export const userFileSchema = createSelectSchema(usersFiles);
