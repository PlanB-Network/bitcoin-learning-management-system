import { z } from 'zod';

import {
  createGetTutorial,
  createGetTutorials,
} from '@sovereign-university/content';
// import {
//   formattedProfessorSchema,
//   joinedTutorialCreditSchema,
//   joinedTutorialSchema,
// } from '@sovereign-university/schemas';

import { publicProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getTutorialsProcedure = publicProcedure
  .input(
    z
      .object({
        language: z.string().optional(),
      })
      .optional(),
  )
  // TODO fix this validation issue
  //.output(joinedTutorialSchema.omit({ rawContent: true }).array())
  .query(async ({ ctx, input }) =>
    createGetTutorials(ctx.dependencies)(undefined, input?.language),
  );

const getTutorialsByCategoryProcedure = publicProcedure
  .input(
    z.object({
      category: z.string(),
      language: z.string().optional(),
    }),
  )
  // TODO fix this validation issue
  //.output(joinedTutorialSchema.omit({ rawContent: true }).array())
  .query(async ({ ctx, input }) =>
    createGetTutorials(ctx.dependencies)(input.category, input.language),
  );

const getTutorialProcedure = publicProcedure
  .input(
    z.object({
      category: z.string(),
      name: z.string(),
      language: z.string(),
    }),
  )
  // TODO fix this validation issue
  // .output(
  //   joinedTutorialSchema.merge(
  //     z.object({
  //       credits: joinedTutorialCreditSchema
  //         .omit({
  //           tutorialId: true,
  //           contributorId: true,
  //           lightningAddress: true,
  //           lnurlPay: true,
  //           paynym: true,
  //           silentPayment: true,
  //           tipsUrl: true,
  //         })
  //         .merge(
  //           z.object({
  //             professor: formattedProfessorSchema.optional(),
  //             tips: z.object({
  //               lightningAddress:
  //                 joinedTutorialCreditSchema.shape.lightningAddress,
  //               lnurlPay: joinedTutorialCreditSchema.shape.lnurlPay,
  //               paynym: joinedTutorialCreditSchema.shape.paynym,
  //               silentPayment: joinedTutorialCreditSchema.shape.silentPayment,
  //               url: joinedTutorialCreditSchema.shape.tipsUrl,
  //             }),
  //           }),
  //         )
  //         .optional(),
  //     }),
  //   ),
  // )
  .query(async ({ ctx, input }) =>
    createGetTutorial(ctx.dependencies)({
      category: input.category,
      name: input.name,
      language: input.language,
    }),
  );

export const tutorialsRouter = createTRPCRouter({
  getTutorialsByCategory: getTutorialsByCategoryProcedure,
  getTutorials: getTutorialsProcedure,
  getTutorial: getTutorialProcedure,
});
