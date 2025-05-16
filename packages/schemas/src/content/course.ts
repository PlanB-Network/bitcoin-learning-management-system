import { CourseLevel } from '@blms/constants';
import {
  contentCourseChapters,
  contentCourseChaptersLocalized,
  contentCourseParts,
  contentCoursePartsLocalized,
  contentCourses,
  contentCoursesAssignment,
  contentCoursesLocalized,
} from '@blms/database';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { formattedProfessorSchema } from './professor.js';

export const courseLevelSchema = z.nativeEnum(CourseLevel);

export const courseSchema = createSelectSchema(contentCourses);
export const courseLocalizedSchema = createSelectSchema(
  contentCoursesLocalized,
);
export const coursePartSchema = createSelectSchema(contentCourseParts);
export const coursePartLocalizedSchema = createSelectSchema(
  contentCoursePartsLocalized,
);

export const courseChapterSchema = createSelectSchema(contentCourseChapters);
export const courseChapterLocalizedSchema = createSelectSchema(
  contentCourseChaptersLocalized,
);

export const courseAssignmentSchema = createSelectSchema(
  contentCoursesAssignment,
);

export const joinedCoursePartLocalizedSchema = coursePartLocalizedSchema
  .pick({
    courseId: true,
    language: true,
    partId: true,
    title: true,
  })
  .merge(
    coursePartSchema.pick({
      partIndex: true,
    }),
  );

export const joinedCourseChapterSchema = courseChapterLocalizedSchema
  .pick({
    addressLine1: true,
    addressLine2: true,
    addressLine3: true,
    availableSeats: true,
    chapterId: true,
    chatUrl: true,
    customTcDisclaimer: true,
    endDate: true,
    isCourseConclusion: true,
    isCourseExam: true,
    isCourseReview: true,
    isGdprCompliance: true,
    isInPerson: true,
    isOnline: true,
    isSingleTrialExam: true,
    language: true,
    liveLanguage: true,
    liveUrl: true,
    rateWeight: true,
    rawContent: true,
    releaseDate: true,
    releasePlace: true,
    remainingSeats: true,
    sections: true,
    startDate: true,
    timezone: true,
    title: true,
  })
  .merge(
    courseChapterSchema.pick({
      chapterIndex: true,
      partId: true,
    }),
  )
  .merge(
    coursePartSchema.pick({
      partIndex: true,
    }),
  )
  .merge(
    z.object({
      partTitle: z.string(),
    }),
  );

export const minimalJoinedCourseSchema = courseSchema
  .pick({
    assignmentWeight: true,
    availableSeats: true,
    contact: true,
    customTcDisclaimer: true,
    endDate: true,
    format: true,
    hasLogo: true,
    hours: true,
    id: true,
    index: true,
    inpersonPriceDollars: true,
    isArchived: true,
    isAssignmentGradingPublished: true,
    isGdprCompliance: true,
    isPlanbSchool: true,
    lastCommit: true,
    lastUpdated: true,
    numberOfRating: true,
    onlinePriceDollars: true,
    originalLanguage: true,
    paidDescription: true,
    paidVideoLink: true,
    passingGradeThreshold: true,
    paymentExpirationDate: true,
    presentationMarkdown: true,
    publishedAt: true,
    remainingSeats: true,
    requiresPayment: true,
    startDate: true,
    subtopic: true,
    sumOfAllRating: true,
    teachingFormat: true,
    topic: true,
    hasAssignment: true,
    assignmentStartDate: true,
    assignmentEndDate: true,
    assignmentDescription: true,
    areScoresCalculated: true,
  })
  .merge(
    z.object({
      projectName: z.string().optional(),
    }),
  )
  .merge(
    courseLocalizedSchema.pick({
      goal: true,
      language: true,
      name: true,
      objectives: true,
      rawDescription: true,
    }),
  )
  .merge(
    z.object({
      chaptersCount: z.number().optional(),
      level: courseLevelSchema,
    }),
  )
  .merge(
    z.object({
      averageRating: z.number(),
    }),
  );

export const joinedCourseProfessorIdSchema = minimalJoinedCourseSchema.merge(
  z.object({
    associatedProfessorIds: z.string().array(),
    averageRating: z.number(),
    mainProfessorIds: z.string().array(),
  }),
);

export const joinedCourseSchema = minimalJoinedCourseSchema.merge(
  z.object({
    associatedProfessors: formattedProfessorSchema.array(),
    averageRating: z.number(),
    mainProfessors: formattedProfessorSchema.array(),
  }),
);

export const joinedCourseChapterWithContentSchema = courseChapterLocalizedSchema
  .pick({
    addressLine1: true,
    addressLine2: true,
    addressLine3: true,
    availableSeats: true,
    chapterId: true,
    chatUrl: true,
    courseId: true,
    customTcDisclaimer: true,
    endDate: true,
    isCourseConclusion: true,
    isCourseExam: true,
    isCourseReview: true,
    isGdprCompliance: true,
    isInPerson: true,
    isOnline: true,
    isSingleTrialExam: true,
    language: true,
    liveLanguage: true,
    liveUrl: true,
    rateWeight: true,
    rawContent: true,
    releasePlace: true,
    remainingSeats: true,
    sections: true,
    startDate: true,
    timezone: true,
    title: true,
  })
  .merge(
    courseChapterSchema.pick({
      chapterIndex: true,
      partId: true,
    }),
  )
  .merge(
    coursePartSchema.pick({
      partIndex: true,
    }),
  )
  .merge(
    courseSchema.pick({
      lastCommit: true,
      lastUpdated: true,
    }),
  )
  .merge(
    z.object({
      professors: z.string().array(),
    }),
  );

export const partWithChaptersSchema = joinedCoursePartLocalizedSchema.merge(
  z.object({
    chapters: joinedCourseChapterSchema.array(),
  }),
);

export const courseResponseSchema = minimalJoinedCourseSchema
  .merge(
    z.object({
      chaptersCount: z.number(),
      parts: z
        .object({
          chapters: joinedCourseChapterSchema.optional().array(),
          language: z.string().optional(),
          part: z.number().optional(),
          title: z.string().optional(),
        })
        .array(),
      partsCount: z.number(),
      professors: formattedProfessorSchema.array(),
    }),
  )
  .omit({
    professors: true,
  })
  .merge(
    z.object({
      associatedProfessors: formattedProfessorSchema.array(),
      chaptersCount: z.number(),
      mainProfessors: formattedProfessorSchema.array(),
      parts: partWithChaptersSchema.array(),
      partsCount: z.number(),
    }),
  );

export const courseChapterResponseSchema =
  joinedCourseChapterWithContentSchema.merge(
    z.object({
      course: courseResponseSchema,
      part: partWithChaptersSchema,
      professors: formattedProfessorSchema.array().optional(),
    }),
  );

export const courseReviewsExtendedSchema = z.object({
  difficulty: z.array(z.number()),
  faithful: z.array(z.number()),
  feedbacks: z.array(
    z.object({
      adminComment: z.string().nullable(),
      date: z.string(),
      publicComment: z.string(),
      teacherComment: z.string().nullable(),
      user: z.string(),
      userPicture: z.string().nullable(),
    }),
  ),
  general: z.array(z.number()),
  length: z.array(z.number()),
  quality: z.array(z.number()),
  recommend: z.array(z.number()),
});

export const courseMetaSchema = minimalJoinedCourseSchema.pick({
  contact: true,
  goal: true,
  id: true,
  index: true,
  language: true,
  lastCommit: true,
  name: true,
  objectives: true,
  subtopic: true,
  topic: true,
});

export const courseChapterMetaSchema = joinedCourseChapterSchema
  .pick({
    chapterId: true,
    language: true,
    liveLanguage: true,
    partId: true,
    rawContent: true,
    releasePlace: true,
    sections: true,
    title: true,
  })
  .merge(
    z.object({
      courseId: z.string(),
      courseIndex: z.string(),
      lastCommit: z.string(),
    }),
  );

export const minimalCourseAssignmentWithStudentsSchema = courseAssignmentSchema
  .pick({
    id: true,
    name: true,
  })
  .merge(
    z.object({
      students: z.array(
        z.object({
          displayName: z.string(),
          grade: z.number().nullable(),
          uid: z.string(),
          username: z.string(),
        }),
      ),
    }),
  );
export const basicCourseSchema = z.object({
  id: z.string(),
  index: z.string(),
  topic: z.string(),
  originalLanguage: z.string(),
  isArchived: z.boolean(),
  publishedAt: z.date().nullable(),
  lastCommit: z.string(),
  name: z.string(),
  goal: z.string(),
});

export const courseTranslationResponseSchema = z.object({
  courseId: z.string(),
  language: z.string(),
});
