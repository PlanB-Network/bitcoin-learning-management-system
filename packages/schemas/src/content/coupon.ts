import { createSelectSchema } from 'drizzle-zod';

import { couponCode } from '@sovereign-university/database';

export const couponCodeSchema = createSelectSchema(couponCode);
