import { z } from 'zod';
import { adminProcedure, studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';

import {
  CareerLanguageLevel,
  CareerRemote,
  CareerRoleLevel,
  UserPermission,
} from '@blms/constants';
import {
  careerCompanySizeSchema,
  jobTitleSchema,
  joinedCareerProfileSchema,
  languageSchema,
} from '@blms/schemas';
import {
  createDeleteCareerProfile,
  createGetCareerProfile,
  createGetCareerProfiles,
  createGetJobTitles,
  createGetLanguages,
  createInsertCareerProfile,
  createUpdateCareerProfile,
} from '@blms/service-user';
import type { JobTitle, JoinedCareerProfile, Language } from '@blms/types';
import { checkPermissions } from '#src/middlewares/auth.js';
import type { Parser } from '#src/trpc/types.js';

const deleteCareerProfileProcedure = studentProcedure
  .input(z.void())
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx }) => {
    await createDeleteCareerProfile(ctx.dependencies)({
      uid: ctx.user.uid,
    });
  });

const getCareerProfileProcedure = studentProcedure
  .input(z.void())
  .output<Parser<JoinedCareerProfile | null>>(
    joinedCareerProfileSchema.nullable(),
  )
  .query(({ ctx }) =>
    createGetCareerProfile(ctx.dependencies)({
      uid: ctx.user.uid,
    }),
  );

const getCareerProfilesProcedure = adminProcedure
  .use(checkPermissions(UserPermission.Career))
  .input(z.void())
  .output<Parser<JoinedCareerProfile[] | null>>(
    joinedCareerProfileSchema.array().nullable(),
  )
  .query(({ ctx }) => createGetCareerProfiles(ctx.dependencies)());

const getJobTitlesProcedure = studentProcedure
  .input(z.void())
  .output<Parser<JobTitle[] | null>>(jobTitleSchema.array().nullable())
  .query(({ ctx }) => createGetJobTitles(ctx.dependencies)());

const getLanguagesProcedure = studentProcedure
  .input(z.void())
  .output<Parser<Language[] | null>>(languageSchema.array().nullable())
  .query(({ ctx }) => createGetLanguages(ctx.dependencies)());

const insertCareerProfileProcedure = studentProcedure
  .input(z.void())
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx }) => {
    await createInsertCareerProfile(ctx.dependencies)({
      uid: ctx.user.uid,
    });
  });

const updateCareerProfileProcedure = studentProcedure
  .input(
    z.object({
      firstName: z.string(),
      lastName: z.string().optional(),
      country: z.string(),
      email: z.string(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
      telegram: z.string().optional(),
      otherContact: z.string().optional(),
      isBitcoinCommunityParticipant: z.boolean(),
      bitcoinCommunityText: z.string().optional(),
      isBitcoinProjectParticipant: z.boolean(),
      bitcoinProjectText: z.string().optional(),
      isAvailableFullTime: z.boolean(),
      remoteWorkPreference: z.nativeEnum(CareerRemote),
      expectedSalary: z.string().optional(),
      availabilityStart: z.string().optional(),
      cvUrl: z.string().optional(),
      motivationLetter: z.string(),
      areTermsAccepted: z.boolean(),
      allowReceivingEmails: z.boolean(),
      languages: z.array(
        z.object({
          languageCode: z.string(),
          level: z.nativeEnum(CareerLanguageLevel),
        }),
      ),
      roles: z.array(
        z.object({
          roleId: z.string(),
          level: z.nativeEnum(CareerRoleLevel),
        }),
      ),
      companySizes: careerCompanySizeSchema.array(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createUpdateCareerProfile(ctx.dependencies)({
      uid: ctx.user.uid,
      data: input,
    });
  });

export const userCareerRouter = createTRPCRouter({
  deleteCareerProfile: deleteCareerProfileProcedure,
  getCareerProfile: getCareerProfileProcedure,
  getCareerProfiles: getCareerProfilesProcedure,
  getJobTitles: getJobTitlesProcedure,
  getLanguages: getLanguagesProcedure,
  insertCareerProfile: insertCareerProfileProcedure,
  updateCareerProfile: updateCareerProfileProcedure,
});
