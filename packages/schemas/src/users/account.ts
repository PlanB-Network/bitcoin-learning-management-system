import { createSelectSchema } from 'drizzle-zod';

import {
  usersAccounts,
  usersLud4PublicKeys,
} from '@sovereign-university/database/schemas';

export const userAccountSchema = createSelectSchema(usersAccounts);
export const userDetailsSchema = userAccountSchema.pick({
  uid: true,
  username: true,
  displayName: true,
  picture: true,
  email: true,
  contributorId: true,
});

export const usersLud4PublicKeySchema = createSelectSchema(usersLud4PublicKeys);
