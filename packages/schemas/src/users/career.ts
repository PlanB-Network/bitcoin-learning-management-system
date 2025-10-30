import {
  CareerCompanySize,
  CareerLanguageLevel,
  CareerRemote,
  CareerRoleLevel,
  JobCategory,
  JobName,
} from '@blms/constants';
import {
  usersCareerLanguages,
  usersCareerProfiles,
  usersCareerRoles,
  usersJobTitles,
  usersLanguages,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const careerLanguageLevelSchema = z.enum(CareerLanguageLevel);

export const careerRoleLevelSchema = z.enum(CareerRoleLevel);
export const careerCompanySizeSchema = z.enum(CareerCompanySize);
export const careerRemoteSchema = z.enum(CareerRemote); //
export const jobNameSchema = z.enum(JobName);
export const jobCategorySchema = z.enum(JobCategory);

export const careerLanguageSchema = createSelectSchema(usersCareerLanguages);
export const careerProfileSchema = createSelectSchema(usersCareerProfiles);
export const careerRoleSchema = createSelectSchema(usersCareerRoles);

export const languageSchema = createSelectSchema(usersLanguages);
export const jobTitleSchema = createSelectSchema(usersJobTitles);

export const joinedCareerProfileSchema = careerProfileSchema.merge(
  z.object({
    companySizes: careerCompanySizeSchema.array(),
    languages: careerLanguageSchema
      .pick({
        languageCode: true,
        level: true,
      })
      .array(),
    roles: careerRoleSchema
      .pick({
        level: true,
        roleId: true,
      })
      .array(),
    courses: z
      .object({
        courseId: z.string(),
        progressPercentage: z.number(),
        totalScore: z.number().optional(),
        ranking: z.number().optional(),
        totalStudents: z.number().optional(),
      })
      .array()
      .optional(),
  }),
);
