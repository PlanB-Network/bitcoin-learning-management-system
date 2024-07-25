import { createSelectSchema } from 'drizzle-zod';

import { usersUserEvent } from '@blms/database';

export const userEventSchema = createSelectSchema(usersUserEvent);
