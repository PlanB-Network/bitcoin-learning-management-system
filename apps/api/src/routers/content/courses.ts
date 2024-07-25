import { z } from 'zod';

import {
  createCalculateCourseChapterSeats,
  createGetCourse,
  createGetCourseChapter,
  createGetCourseChapterQuizQuestions,
  createGetCourseChapters,
  createGetCourses,
} from '@blms/content';
import {
  joinedCourseChapterSchema,
  joinedCourseWithAllSchema,
  joinedCourseWithProfessorsSchema,
  joinedQuizQuestionSchema,
} from '@blms/schemas';
import type {
  JoinedCourseChapter,
  JoinedCourseWithAll,
  JoinedCourseWithProfessors,
} from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

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
  .output<Parser<JoinedCourseWithProfessors[]>>(
    joinedCourseWithProfessorsSchema.array(),
  )
  .query(({ ctx, input }) => {
    return createGetCourses(ctx.dependencies)(input?.language);
  });

const getCourseProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<JoinedCourseWithAll>>(joinedCourseWithAllSchema)
  .query(({ ctx, input }) => {
    return createGetCourse(ctx.dependencies)(input.id, input.language);
  });

const getCourseChaptersProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      language: z.string(),
    }),
  )
  .output<Parser<JoinedCourseChapter[]>>(joinedCourseChapterSchema.array())
  .query(({ ctx, input }) => {
    return createGetCourseChapters(ctx.dependencies)(input.id, input.language);
  });

const getCourseChapterProcedure = publicProcedure
  .input(
    z.object({
      language: z.string(),
      chapterId: z.string(),
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
  .query(({ ctx, input }) => {
    return createGetCourseChapter(ctx.dependencies)(
      input.chapterId,
      input.language,
    );
  });

const getCourseChapterQuizQuestionsProcedure = publicProcedure
  .input(
    z.object({
      chapterId: z.string(),
      language: z.string(),
    }),
  )
  .output(joinedQuizQuestionSchema.array())
  .query(({ ctx, input }) => {
    return createGetCourseChapterQuizQuestions(ctx.dependencies)({
      chapterId: input.chapterId,
      language: input.language,
    });
  });

const calculateCourseChapterSeatsProcedure = publicProcedure
  .input(
    z.object({
      oldPassword: z.string(),
      newPassword: z.string(),
    }),
  )
  .mutation(({ ctx }) => {
    return createCalculateCourseChapterSeats(ctx.dependencies)();
  });

export const coursesRouter = createTRPCRouter({
  getCourses: getCoursesProcedure,
  getCourse: getCourseProcedure,
  getCourseChapters: getCourseChaptersProcedure,
  getCourseChapter: getCourseChapterProcedure,
  getCourseChapterQuizQuestions: getCourseChapterQuizQuestionsProcedure,
  calculateCourseChapterSeats: calculateCourseChapterSeatsProcedure,
});
