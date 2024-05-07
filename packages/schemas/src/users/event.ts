import { createSelectSchema } from 'drizzle-zod';

import { usersUserEvent } from '@sovereign-university/database/schemas';

export const userEventSchema = createSelectSchema(usersUserEvent);
