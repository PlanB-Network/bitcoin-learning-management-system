import { z } from 'zod';

import {
  createCalculateCourseChapterSeats,
  createGetCourse,
  createGetCourseChapter,
  createGetCourseChapterQuizQuestions,
  createGetCourseChapters,
  createGetCourses,
} from '@sovereign-university/content';
import {
  joinedCourseChapterSchema,
  joinedCourseWithAllSchema,
  joinedCourseWithProfessorsSchema,
  joinedQuizQuestionSchema,
} from '@sovereign-university/schemas';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getCoursesProcedure = publicProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  .output(joinedCourseWithProfessorsSchema.array())
  .query(async ({ ctx, input }) =>
    createGetCourses(ctx.dependencies)(input?.language),
  );

const getCourseProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output(joinedCourseWithAllSchema)
  .query(async ({ ctx, input }) =>
    createGetCourse(ctx.dependencies)(input.id, input.language),
  );

const getCourseChaptersProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output(joinedCourseChapterSchema.array())
  .query(async ({ ctx, input }) =>
    createGetCourseChapters(ctx.dependencies)(input.id, input.language),
  );

const getCourseChapterProcedure = publicProcedure
  .input(
    z.object({
      courseId: z.string(),
      language: z.string(),
      partIndex: z.string(),
      chapterIndex: z.string(),
    }),
  )
  // TODO fix this validation issue
  // .output(
  //   joinedCourseChapterWithContentSchema.merge(
  //     z.object({
  //       course: joinedCourseSchema.merge(
  //         z.object({
  //           professors: formattedProfessorSchema.array(),
  //           parts: coursePartLocalizedSchema
  //             .merge(
  //               z.object({
  //                 chapters: joinedCourseChapterSchema.array(),
  //               }),
  //             )
  //             .array(),
  //           partsCount: z.number(),
  //           chaptersCount: z.number(),
  //         }),
  //       ),
  //       part: coursePartSchema.merge(
  //         z.object({
  //           chapters: joinedCourseChapterSchema.array(),
  //         }),
  //       ),
  //     }),
  //   ),
  // )
  .query(async ({ ctx, input }) =>
    createGetCourseChapter(ctx.dependencies)(
      input.courseId,
      Number(input.partIndex),
      Number(input.chapterIndex),
      input.language,
    ),
  );

const getCourseChapterQuizQuestionsProcedure = publicProcedure
  .input(
    z.object({
      courseId: z.string(),
      language: z.string(),
      partIndex: z.string(),
      chapterIndex: z.string(),
    }),
  )
  .output(joinedQuizQuestionSchema.array())
  .query(async ({ ctx, input }) =>
    createGetCourseChapterQuizQuestions(ctx.dependencies)({
      courseId: input.courseId,
      partIndex: Number(input.partIndex),
      chapterIndex: Number(input.chapterIndex),
      language: input.language,
    }),
  );

const calculateCourseChapterSeatsProcedure = publicProcedure
  .input(
    z.object({
      oldPassword: z.string(),
      newPassword: z.string(),
    }),
  )
  .mutation(async ({ ctx }) =>
    createCalculateCourseChapterSeats(ctx.dependencies)(),
  );

export const coursesRouter = createTRPCRouter({
  getCourses: getCoursesProcedure,
  getCourse: getCourseProcedure,
  getCourseChapters: getCourseChaptersProcedure,
  getCourseChapter: getCourseChapterProcedure,
  getCourseChapterQuizQuestions: getCourseChapterQuizQuestionsProcedure,
  calculateCourseChapterSeats: calculateCourseChapterSeatsProcedure,
});
