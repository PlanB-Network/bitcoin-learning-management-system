import { createSelectSchema } from 'drizzle-zod';

import { couponCode } from '@blms/database';

export const couponCodeSchema = createSelectSchema(couponCode);
