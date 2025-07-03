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
import { z } from 'zod';
import { checkPermissions } from '#src/middlewares/auth.js';
import { adminProcedure, studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
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
      allowReceivingEmails: z.boolean(),
      areTermsAccepted: z.boolean(),
      availabilityStart: z.string().optional(),
      bitcoinCommunityText: z.string().optional(),
      bitcoinProjectText: z.string().optional(),
      companySizes: careerCompanySizeSchema.array(),
      country: z.string(),
      cvUrl: z.string().optional(),
      email: z.string(),
      expectedSalary: z.string().optional(),
      firstName: z.string(),
      github: z.string().optional(),
      isAvailableFullTime: z.boolean(),
      isBitcoinCommunityParticipant: z.boolean(),
      isBitcoinProjectParticipant: z.boolean(),
      languages: z.array(
        z.object({
          languageCode: z.string(),
          level: z.nativeEnum(CareerLanguageLevel),
        }),
      ),
      lastName: z.string().optional(),
      linkedin: z.string().optional(),
      motivationLetter: z.string(),
      otherContact: z.string().optional(),
      remoteWorkPreference: z.nativeEnum(CareerRemote),
      roles: z.array(
        z.object({
          level: z.nativeEnum(CareerRoleLevel),
          roleId: z.string(),
        }),
      ),
      telegram: z.string().optional(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(async ({ ctx, input }) => {
    await createUpdateCareerProfile(ctx.dependencies)({
      data: input,
      uid: ctx.user.uid,
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
