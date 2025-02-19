import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  usersCareerLanguages,
  usersCareerProfiles,
  usersCareerRoles,
  usersJobTitles,
  usersLanguages,
} from '@blms/database';

import {
  CareerCompanySize,
  CareerLanguageLevel,
  CareerRemote,
  CareerRoleLevel,
  JobCategory,
  JobName,
} from '@blms/constants';

export const careerLanguageLevelSchema = z.nativeEnum(CareerLanguageLevel);

export const careerRoleLevelSchema = z.nativeEnum(CareerRoleLevel);
export const careerCompanySizeSchema = z.nativeEnum(CareerCompanySize);
export const careerRemoteSchema = z.nativeEnum(CareerRemote); //
export const jobNameSchema = z.nativeEnum(JobName);
export const jobCategorySchema = z.nativeEnum(JobCategory);

export const careerLanguageSchema = createSelectSchema(usersCareerLanguages);
export const careerProfileSchema = createSelectSchema(usersCareerProfiles);
export const careerRoleSchema = createSelectSchema(usersCareerRoles);

export const languageSchema = createSelectSchema(usersLanguages);
export const jobTitleSchema = createSelectSchema(usersJobTitles);

export const joinedCareerProfileSchema = careerProfileSchema.merge(
  z.object({
    languages: careerLanguageSchema
      .pick({
        languageCode: true,
        level: true,
      })
      .array(),
    roles: careerRoleSchema
      .pick({
        roleId: true,
        level: true,
      })
      .array(),
    companySizes: careerCompanySizeSchema.array(),
  }),
);
