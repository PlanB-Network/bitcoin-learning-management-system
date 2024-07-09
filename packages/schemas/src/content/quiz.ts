import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentQuizQuestions,
  contentQuizQuestionsLocalized,
} from '@sovereign-university/database';

export const quizQuestionSchema = createSelectSchema(contentQuizQuestions);
export const quizQuestionLocalizedSchema = createSelectSchema(
  contentQuizQuestionsLocalized,
  {
    // TODO: Remove this when the issue is fixed
    // https://github.com/drizzle-team/drizzle-orm/issues/1609
    wrongAnswers: z.array(z.string()),
  },
);

export const joinedQuizQuestionSchema = quizQuestionSchema
  .merge(
    quizQuestionLocalizedSchema.pick({
      language: true,
      question: true,
      answer: true,
      wrongAnswers: true,
      explanation: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()),
    }),
  );
