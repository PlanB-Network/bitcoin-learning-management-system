import { createSelectSchema } from 'drizzle-zod';

import { userExamTimestamps } from '@blms/database';

export const userExamTimestampSchema = createSelectSchema(userExamTimestamps);

export const minimalUserExamTimestampSchema = userExamTimestampSchema.pick({
  id: true,
  uid: true,
  courseId: true,
  confirmed: true,
  examAttemptId: true,
  imgKey: true,
  pdfKey: true,
});
