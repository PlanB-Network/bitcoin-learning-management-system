import {
  usersCoursePayment,
  usersCourseProgress,
  usersCourseReview,
  usersCourseUserChapter,
  usersExamAttempts,
  usersExamQuestions,
  usersQuizAttempts,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { courseChapterSchema } from '../content/index.js';

export const courseProgressSchema = createSelectSchema(usersCourseProgress);
export const coursePaymentSchema = createSelectSchema(usersCoursePayment);
export const courseUserChapterSchema = createSelectSchema(
  usersCourseUserChapter,
);
export const courseQuizAttemptsSchema = createSelectSchema(usersQuizAttempts);
export const courseReviewSchema = createSelectSchema(usersCourseReview);

export const courseExamAttemptSchema = createSelectSchema(usersExamAttempts);
export const courseExamQuestionSchema = createSelectSchema(usersExamQuestions);

export const coursePaymentLightSchema = coursePaymentSchema.pick({
  amount: true,
  courseId: true,
  format: true,
  invoiceUrl: true,
  paymentId: true,
  paymentStatus: true,
});

export const courseExamInfoSchema = z.object({
  endDate: z.date().nullable(),
  isSingleTrialExam: z.boolean(),
  nbQuestions: z.number(),
  startDate: z.date().nullable(),
});

export const courseProgressExtendedSchema = courseProgressSchema.merge(
  z.object({
    chapters: z.array(
      courseUserChapterSchema.pick({
        chapterId: true,
        completedAt: true,
      }),
    ),
    courseIndex: z.string(),
    lastCompletedChapter: courseUserChapterSchema
      .pick({
        chapterId: true,
        completedAt: true,
      })
      .optional(),
    nextChapter: courseChapterSchema
      .pick({
        chapterId: true,
        chapterIndex: true,
        courseId: true,
      })
      .optional(),
    totalChapters: z.number(),
  }),
);

export const getUserChapterResponseSchema = courseUserChapterSchema.pick({
  booked: true,
  chapterId: true,
  completedAt: true,
  courseId: true,
});

export const partialExamQuestionSchema = courseExamQuestionSchema
  .pick({
    id: true,
  })
  .merge(
    z.object({
      answers: z
        .object({
          order: z.number(),
          text: z.string(),
        })
        .array(),
      text: z.string(),
    }),
  );

export const courseExamResultsSchema = courseExamAttemptSchema
  .pick({
    finalized: true,
    finishedAt: true,
    id: true,
    score: true,
    startedAt: true,
    succeeded: true,
  })
  .merge(
    z.object({
      imgKey: z.string().optional(),
      isTimestamped: z.boolean().optional(),
      pdfKey: z.string().optional(),
      questions: z.array(
        z.object({
          answers: z.array(
            z.object({
              correctAnswer: z.boolean(),
              order: z.number(),
              text: z.string(),
            }),
          ),
          chapterIndex: z.number(),
          chapterLink: z.string(),
          chapterName: z.string(),
          chapterPart: z.number(),
          explanation: z.string(),
          text: z.string(),
          userAnswer: z.number().nullable(),
        }),
      ),
    }),
  );

export const courseExamResultsExtendedSchema = courseExamResultsSchema.merge(
  z.object({
    totalAnsweredAnswers: z.number(),
    totalGoodUserAnswer: z.number(),
    totalWrongUserAnswer: z.number(),
    userExamDuration: z.number(),
  }),
);

export const courseSucceededExamSchema = courseExamAttemptSchema
  .pick({
    courseId: true,
    finalized: true,
    finishedAt: true,
    score: true,
    startedAt: true,
    succeeded: true,
  })
  .merge(z.object({ courseName: z.string() }));

export const minimalCourseExamAttemptWithUsernameSchema =
  courseExamAttemptSchema
    .pick({
      chapterId: true,
      examType: true,
      finishedAt: true,
      score: true,
      startedAt: true,
      uid: true,
    })
    .merge(
      z.object({
        username: z.string(),
      }),
    );

export const minimalAssignmentGradeSchema = z.object({
  assignmentGrade: z.number().nullable(),
  uid: z.string(),
  username: z.string(),
});

export const courseWithSingleTrialExamsGradesAndSummarySchema = z.object({
  assignmentGrades: z.array(
    z.object({
      assignmentGrade: z.number().nullable(),
      uid: z.string(),
      username: z.string(),
    }),
  ),
  averageTotalScore: z.number(),
  examsGrades: z.array(minimalCourseExamAttemptWithUsernameSchema),
  graduatedStudentsAmount: z.number(),
});

export const singleTrialExamQuestionStatisticsSchema = z.object({
  questionDifficulty: z.string(),
  questionId: z.string(),
  questionText: z.string(),
  successPercentage: z.number(),
  totalAnswers: z.number(),
});
