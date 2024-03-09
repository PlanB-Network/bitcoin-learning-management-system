import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  contentQuizQuestions,
  contentQuizQuestionsLocalized,
} from '@sovereign-university/database/schemas';

export const quizQuestionSchema = createSelectSchema(contentQuizQuestions);
export const quizQuestionLocalizedSchema = createSelectSchema(
  contentQuizQuestionsLocalized,
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
