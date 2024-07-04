import { createSelectSchema } from 'drizzle-zod';

import { usersUserEvent } from '@sovereign-university/database';

export const userEventSchema = createSelectSchema(usersUserEvent);
