import { userExamTimestamps } from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';

export const userExamTimestampSchema = createSelectSchema(userExamTimestamps);

export const minimalUserExamTimestampSchema = userExamTimestampSchema.pick({
  confirmed: true,
  courseId: true,
  examAttemptId: true,
  id: true,
  imgKey: true,
  pdfKey: true,
  uid: true,
});
