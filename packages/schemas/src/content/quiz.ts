import {
  contentQuizAnswers,
  contentQuizAnswersLocalized,
  contentQuizQuestions,
  contentQuizQuestionsLocalized,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const quizQuestionSchema = createSelectSchema(contentQuizQuestions);
export const quizAnswerSchema = createSelectSchema(contentQuizAnswers);

export const quizQuestionLocalizedSchema = createSelectSchema(
  contentQuizQuestionsLocalized,
);

export const quizAnswerLocalizedSchema = createSelectSchema(
  contentQuizAnswersLocalized,
);

export const quizQuestionsCountSchema = z.object({
  chapterId: z.string(),
  count: z.number(),
});

export const joinedQuizQuestionSchema = quizQuestionSchema
  .merge(
    quizQuestionLocalizedSchema.pick({
      answer: true,
      explanation: true,
      language: true,
      question: true,
      wrongAnswers: true,
    }),
  )
  .merge(
    z.object({
      tags: z.array(z.string()),
    }),
  );
