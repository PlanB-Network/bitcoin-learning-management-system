import {
  BetType,
  CareerCompanySize,
  CareerLanguageLevel,
  CareerRemote,
  CareerRoleLevel,
  CourseFormat,
  CoursePaymentFormat,
  CoursePaymentMethod,
  EventType,
  ExamType,
  GeneralPaymentItem,
  JobCategory,
  JobName,
  NotificationType,
  StudentGroup,
  TeachingFormat,
  TokenType,
  UserPermission,
  UserRole,
  VideoProvider,
} from '@blms/constants';
import {
  customType,
  foreignKey,
  index,
  jsonb,
  type PgEnum,
  pgEnum,
  pgSchema,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core';

type StringEnum = Record<string, string>;

interface PgNativeEnum<E extends StringEnum>
  extends PgEnum<[E[keyof E], ...E[keyof E][]]> {}

const pgNativeEnum = <N extends string, E extends StringEnum>(name: N, e: E) =>
  pgEnum(
    name,
    Object.values(e) as [E[keyof E], ...E[keyof E][]],
  ) as PgNativeEnum<E>;

const blob = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return 'bytea';
  },
});

export const users = pgSchema('users');
export const content = pgSchema('content');

// ACCOUNTS

export const userRoleEnum = pgNativeEnum('user_role', UserRole);
export const userPermissionsEnum = pgNativeEnum(
  'user_permission',
  UserPermission,
);

export const usersAccounts = users.table('accounts', (t) => ({
  certificateName: t.varchar({ length: 255 }),
  contributorId: t.varchar({ length: 20 }).unique().notNull(),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  currentEmailChecked: t.boolean().default(false).notNull(),
  displayName: t.varchar({ length: 255 }),
  email: t.varchar({ length: 255 }).unique(),
  lastEmailChangeRequest: t.timestamp({ withTimezone: true }),
  passwordHash: t.varchar({ length: 255 }),
  permissions: userPermissionsEnum().array().default([]),
  picture: t.uuid(),
  professorId: t
    .uuid()
    .unique()
    .references(() => contentProfessors.id, {
      onUpdate: 'cascade',
    }),
  role: userRoleEnum().default(UserRole.Student).notNull(),
  uid: t.uuid().defaultRandom().primaryKey().notNull(),
  university: t.varchar({ length: 100 }).unique(),
  updatedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  username: t.varchar({ length: 255 }).unique().notNull(),
}));

export const usersAccountSettings = users.table('account_settings', (t) => ({
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

  emailNotifyCourses: t.boolean().default(true).notNull(),
  emailNotifyGeneral: t.boolean().default(true).notNull(),
  platformNotifyCourses: t.boolean().default(true).notNull(),

  platformNotifyEvents: t.boolean().default(true).notNull(),
  platformNotifyGeneral: t.boolean().default(true).notNull(),
  uid: t
    .uuid()
    .primaryKey()
    .notNull()
    .references(() => usersAccounts.uid, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  unsubscribeId: t.uuid().defaultRandom().notNull().unique(),
  updatedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

// SESSIONS

export const usersSessions = users.table('sessions', (t) => ({
  cookie: jsonb().notNull(),
  expires: t.timestamp({ withTimezone: true }).notNull(),
  sid: t.varchar({ length: 255 }).primaryKey().notNull(),
  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
}));

// CAREER

export const careerLanguageLevelEnum = pgNativeEnum(
  'career_language_level',
  CareerLanguageLevel,
);

export const careerRoleLevelEnum = pgNativeEnum(
  'career_role_level',
  CareerRoleLevel,
);

export const careerCompanySizeEnum = pgNativeEnum(
  'career_company_size',
  CareerCompanySize,
);

export const careerRemoteEnum = pgNativeEnum('career_remote', CareerRemote);

export const jobNameEnum = pgNativeEnum('job_name', JobName);

export const jobCategoryEnum = pgNativeEnum('job_category', JobCategory);

export const usersCareerProfiles = users.table('career_profiles', (t) => ({
  allowReceivingEmails: t.boolean().default(false).notNull(),

  // Agreement
  areTermsAccepted: t.boolean().default(false).notNull(),
  availabilityStart: t.text(),
  bitcoinCommunityText: t.text(),
  bitcoinProjectText: t.text(),
  country: t.text(),

  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

  // CV/Resume and Motivation Letter
  cvUrl: t.text(),
  editedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

  // Contact
  email: t.text(),
  expectedSalary: t.text(),

  // Primary infos
  firstName: t.text(),
  github: t.text(),
  id: t.uuid().primaryKey().notNull(),

  // Job preferences
  isAvailableFullTime: t.boolean().default(true).notNull(),

  // Bitcoin related experiences
  isBitcoinCommunityParticipant: t.boolean().default(false).notNull(),
  isBitcoinProjectParticipant: t.boolean().default(false).notNull(),
  lastName: t.text(),
  linkedin: t.text(),
  motivationLetter: t.text(),
  otherContact: t.text(),
  remoteWorkPreference: careerRemoteEnum().default(CareerRemote.Yes).notNull(),
  telegram: t.text(),
  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .unique(),
}));

export const usersCareerLanguages = users.table(
  'career_languages',
  (t) => ({
    careerProfileId: t
      .uuid()
      .notNull()
      .references(() => usersCareerProfiles.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    languageCode: t
      .text()
      .notNull()
      .references(() => usersLanguages.code, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    level: careerLanguageLevelEnum().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.careerProfileId, table.languageCode],
    }),
  }),
);

export const usersCareerRoles = users.table(
  'career_roles',
  (t) => ({
    careerProfileId: t
      .uuid()
      .notNull()
      .references(() => usersCareerProfiles.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    level: careerRoleLevelEnum().notNull(),
    roleId: t
      .uuid()
      .notNull()
      .references(() => usersJobTitles.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.careerProfileId, table.roleId],
    }),
  }),
);

export const usersCareerCompanySizes = users.table(
  'career_company_sizes',
  (t) => ({
    careerProfileId: t
      .uuid()
      .notNull()
      .references(() => usersCareerProfiles.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    size: careerCompanySizeEnum().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.careerProfileId, table.size],
    }),
  }),
);

export const usersLanguages = users.table('languages', (t) => ({
  code: t.text().primaryKey().notNull(),
  name: t.text().notNull(),
  nativeName: t.text().notNull(),
}));

export const usersJobTitles = users.table('job_titles', (t) => ({
  category: jobCategoryEnum().notNull(),
  id: t.uuid().primaryKey().notNull(),
  name: jobNameEnum().notNull(),
}));

// BLOGS

export const contentBlogs = content.table('blogs', (t) => ({
  author: t.varchar({ length: 255 }),

  category: t.varchar({ length: 255 }).notNull(),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  date: t.timestamp({ withTimezone: true }).notNull(),
  id: t.uuid().primaryKey(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

  lastUpdated: t
    .timestamp({
      withTimezone: true,
    })
    .defaultNow()
    .notNull(),
  path: t.varchar({ length: 255 }).notNull(),
}));

export const contentBlogsLocalized = content.table(
  'blogs_localized',
  (t) => ({
    blogId: t
      .uuid()
      .notNull()
      .references(() => contentBlogs.id),
    description: t.text(),
    language: t.varchar({ length: 10 }).notNull(),
    rawContent: t.text().notNull(),
    title: t.text().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.blogId, table.language],
    }),
  }),
);

export const contentBlogTags = content.table(
  'blog_tags',
  (t) => ({
    blogId: t
      .uuid()
      .notNull()
      .references(() => contentBlogs.id),
    tagId: t
      .integer()
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.blogId, table.tagId],
    }),
  }),
);

// LUD4 PUBLIC KEYS (LNURL)

export const usersLud4PublicKeys = users.table('lud4_public_keys', (t) => ({
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  id: t.uuid().defaultRandom().primaryKey().notNull(),
  publicKey: t.text().unique().notNull(),
  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  updatedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

// API KEYS

export const usersApiKeys = users.table('api_keys', (t) => ({
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  expiresAt: t.timestamp({ withTimezone: true }),
  id: t.uuid().defaultRandom().primaryKey().notNull(),
  revokedAt: t.timestamp({ withTimezone: true }),
  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  updatedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

// BCERT

export const contentBCertificateExam = content.table(
  'b_certificate_exam',
  (t) => ({
    date: t.timestamp().notNull(),
    duration: t.integer().notNull(),
    id: t.uuid().primaryKey().notNull(),
    lastCommit: t.varchar({ length: 40 }).notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    location: t.text().notNull(),
    minScore: t.integer().notNull(),
    path: t.varchar({ length: 255 }).notNull(),
  }),
);

export const usersBCertificateResults = users.table(
  'b_certificate_results',
  (t) => ({
    bCertificateExam: t
      .uuid()
      .notNull()
      .references(() => contentBCertificateExam.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    category: t.varchar().notNull(),
    lastCommit: t.varchar({ length: 40 }).notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    score: t.integer().notNull(),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.bCertificateExam, table.category],
    }),
  }),
);

export const usersBCertificateTimestamps = users.table(
  'b_certificate_timestamps',
  (t) => ({
    bCertificateExam: t
      .uuid()
      .notNull()
      .references(() => contentBCertificateExam.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    createdAt: t.timestamp().defaultNow().notNull(),
    imgKey: t.varchar({ length: 255 }),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

    pdfKey: t.varchar({ length: 255 }),
    txtKey: t.varchar({ length: 255 }),
    txtOtsKey: t.varchar({ length: 255 }),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.bCertificateExam],
    }),
  }),
);

// RESOURCES

export const contentResources = content.table('resources', (t) => ({
  category: t.varchar({ length: 255 }).notNull(),
  id: t.uuid().notNull().primaryKey(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  lastUpdated: t
    .timestamp({
      withTimezone: true,
    })
    .defaultNow()
    .notNull(),
  path: t.varchar({ length: 255 }).notNull(),
}));

export const contentTags = content.table('tags', (t) => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  name: t.varchar({ length: 255 }).unique().notNull(),
}));

export const contentResourceTags = content.table(
  'resource_tags',
  (t) => ({
    resourceId: t
      .uuid()
      .notNull()
      .references(() => contentResources.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    tagId: t
      .integer()
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.resourceId, table.tagId],
    }),
  }),
);

// BET

export const betTypeEnum = pgNativeEnum('bet_type', BetType);

export const contentBet = content.table('bet', (t) => ({
  downloadUrl: t.text().notNull(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),
  projectId: t
    .uuid()
    .references(() => contentProjects.id, { onDelete: 'set null' }),
  resourceId: t
    .uuid()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  type: betTypeEnum().notNull(),
}));

export const contentBetViewUrl = content.table(
  'bet_view_url',
  (t) => ({
    betId: t
      .uuid()
      .notNull()
      .references(() => contentBet.resourceId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    language: t.text().notNull(),
    viewUrl: t.text().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.betId, table.language],
    }),
  }),
);

export const contentBetLocalized = content.table(
  'bet_localized',
  (t) => ({
    betId: t
      .uuid()
      .notNull()
      .references(() => contentBet.resourceId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    description: t.text().notNull(),
    language: t.varchar({ length: 10 }).notNull(),

    // Per translation
    name: t.text().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.betId, table.language],
    }),
  }),
);

// BOOKS

export const contentBooks = content.table('books', (t) => ({
  author: t.text().notNull(),
  level: t.varchar({ length: 255 }),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),
  resourceId: t
    .uuid()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  websiteUrl: t.text(),
}));

export const contentBooksLocalized = content.table(
  'books_localized',
  (t) => ({
    bookId: t
      .uuid()
      .notNull()
      .references(() => contentBooks.resourceId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    cover: t.text(),
    description: t.text(),
    downloadUrl: t.text(),
    language: t.varchar({ length: 10 }).notNull(),
    original: t.boolean().notNull(),
    publicationYear: t.integer(),
    publisher: t.varchar({ length: 255 }),

    // Links
    shopUrl: t.text(),
    summaryContributorId: t.varchar({ length: 20 }),
    summaryText: t.text(),

    // Per translation
    title: t.text().notNull(),
    translator: t.text(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.bookId, table.language],
    }),
  }),
);

// PROJECTS

export const contentProjects = content.table('projects', (t) => ({
  addressLine1: t.text('address_line_1'),
  addressLine2: t.text('address_line_2'),
  addressLine3: t.text('address_line_3'),
  category: t.varchar({ length: 255 }).notNull(),
  githubUrl: t.text(),
  id: t.uuid().primaryKey().unique(),
  languages: t.varchar({ length: 255 }).array(),
  name: t.text().notNull(),
  nostr: t.text(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),
  resourceId: t
    .uuid()
    .notNull()
    .references(() => contentResources.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  twitterUrl: t.text(),

  // Links
  websiteUrl: t.text(),
}));

export const contentProjectsLocalized = content.table(
  'projects_localized',
  (t) => ({
    // Per translation
    description: t.text(),
    id: t
      .uuid()
      .references(() => contentProjects.id, { onDelete: 'cascade' })
      .notNull(),
    language: t.varchar({ length: 10 }).notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.id, table.language],
    }),
  }),
);

/**
 * Coordinates for projects, bound by address_line_1
 */
export const contentProjectLocation = content.table(
  'projects_locations',
  (t) => ({
    lat: t.doublePrecision().notNull(), // OSM place_id
    lng: t.doublePrecision().notNull(), // address_line_1 in the projects table
    name: t.text().primaryKey(),
    placeId: t.integer().notNull(),
  }),
);

// CONFERENCES

export const contentConferences = content.table('conferences', (t) => ({
  description: t.text(),
  languages: t.varchar({ length: 255 }).array(),
  location: t.text().notNull(),
  name: t.text().notNull(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),
  projectId: t
    .uuid()
    .references(() => contentProjects.id, { onDelete: 'set null' }),
  resourceId: t
    .uuid()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  twitterUrl: t.text(),

  // Links
  websiteUrl: t.text(),
  year: t.text().notNull(),
}));

export const contentConferencesStages = content.table(
  'conferences_stages',
  (t) => ({
    conferenceId: t
      .uuid()
      .notNull()
      .references(() => contentConferences.resourceId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    name: t.text().notNull(),
    stageId: t.varchar().primaryKey().notNull(),
  }),
);

export const contentConferenceStageVideos = content.table(
  'conferences_stages_videos',
  (t) => ({
    name: t.text().notNull(),
    rawContent: t.text().notNull(),
    stageId: t
      .varchar()
      .notNull()
      .references(() => contentConferencesStages.stageId, {
        onDelete: 'cascade',
      }),
    videoId: t.varchar().primaryKey().notNull(),
  }),
);

// LEGAL INFORMATION

export const contentLegals = content.table(
  'legals',
  (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
    lastCommit: t.varchar({ length: 40 }).notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),

    name: t.varchar({ length: 255 }).notNull(),
    path: t.varchar({ length: 255 }).unique().notNull(),
  }),
  (table) => ({
    unqName: unique().on(table.name),
  }),
);

export const contentLegalsLocalized = content.table(
  'legals_localized',
  (t) => ({
    id: t
      .integer()
      .notNull()
      .references(() => contentLegals.id, { onDelete: 'cascade' }),
    language: t.varchar({ length: 10 }).notNull(),
    rawContent: t.text().notNull(),
    title: t.text().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.id, table.language],
    }),
  }),
);

// MOVIES

export const contentMovies = content.table('movies', (t) => ({
  author: t.text().notNull(),
  description: t.text(),
  duration: t.integer(),
  id: t.uuid().unique().notNull(),

  language: t.varchar({ length: 10 }).notNull(),

  // Links
  platform: t.text().notNull(),
  publicationYear: t.integer(),
  resourceId: t
    .uuid()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),

  title: t.text().notNull(),
  trailer: t.text().notNull(),
}));

// NEWSLETTER

export const contentNewsletters = content.table('newsletters', (t) => ({
  author: t.text().notNull(),
  contributors: t.text().array(),
  description: t.text(),
  id: t.uuid().unique().notNull(),
  language: t.varchar({ length: 10 }).notNull(),

  level: t.varchar({ length: 255 }),

  projectId: t
    .uuid()
    .references(() => contentProjects.id, { onDelete: 'set null' }),
  publication_date: t.text(),
  resourceId: t
    .uuid()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  tags: t.text().array(),
  title: t.text().notNull(),
  websiteUrl: t.text(),
}));

// PODCASTS

export const contentPodcasts = content.table('podcasts', (t) => ({
  description: t.text(),
  host: t.text().notNull(),
  language: t.varchar({ length: 10 }).notNull(),

  name: t.text().notNull(),
  nostr: t.text(),
  podcastUrl: t.text(),
  resourceId: t
    .uuid()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  twitterUrl: t.text(),

  // Links
  websiteUrl: t.text(),
}));

// GLOSSARY WORDS

export const contentGlossaryWords = content.table('glossary_words', (t) => ({
  fileName: t.text().notNull(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),
  originalWord: t.text().notNull(),
  relatedWords: t.varchar({ length: 255 }).array(),
  resourceId: t
    .uuid()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
}));

export const contentGlossaryWordsLocalized = content.table(
  'glossary_words_localized',
  (t) => ({
    definition: t.text().notNull(),
    glossaryWordId: t
      .uuid()
      .notNull()
      .references(() => contentGlossaryWords.resourceId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    language: t.varchar({ length: 10 }).notNull(),

    // Per translation
    term: t.text().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.glossaryWordId, table.language],
    }),
  }),
);

// YOUTUBE CHANNELS

export const contentYoutubeChannels = content.table(
  'youtube_channels',
  (t) => ({
    // Links
    channel: t.text().notNull(),
    description: t.text(),
    id: t.uuid().unique().notNull(),

    language: t.varchar({ length: 10 }).notNull(),

    name: t.text().notNull(),

    projectId: t
      .uuid()
      .references(() => contentProjects.id, { onDelete: 'set null' }),
    resourceId: t
      .uuid()
      .primaryKey()
      .notNull()
      .references(() => contentResources.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    trailer: t.text().notNull(),
  }),
);

// COURSES

export const courseFormatEnum = pgNativeEnum('course_format', CourseFormat);
export const teachingFormatEnum = pgNativeEnum(
  'teaching_format',
  TeachingFormat,
);

export const contentCourses = content.table('courses', (t) => ({
  areScoresCalculated: t.boolean().default(false).notNull(),
  assignmentDescription: t.text(),
  assignmentEndDate: t.timestamp({ withTimezone: true }),
  assignmentStartDate: t.timestamp({ withTimezone: true }),
  assignmentWeight: t.integer(),
  availableSeats: t.integer().default(0),
  contact: t.varchar({ length: 255 }),
  customTcDisclaimer: t.text(),
  endDate: t.timestamp({ withTimezone: true }),
  format: courseFormatEnum().default(CourseFormat.Online).notNull(),
  hasAssignment: t.boolean().notNull().default(false),
  hasLogo: t.boolean().notNull().default(false),
  hours: t.doublePrecision().notNull(),
  id: t.varchar({ length: 100 }).primaryKey().notNull(),
  index: t.varchar({ length: 20 }).unique().notNull(),
  inpersonPriceDollars: t.integer(),

  isArchived: t.boolean().default(false).notNull(),

  isAssignmentGradingPublished: t.boolean().notNull().default(false),

  isGdprCompliance: t.boolean().notNull().default(false),

  isPlanbSchool: t.boolean().default(false).notNull(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

  lastUpdated: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

  level: t.varchar({ length: 255 }).notNull(),
  numberOfRating: t.integer().default(0).notNull(),
  onlinePriceDollars: t.integer(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),
  paidDescription: t.text(),
  paidVideoLink: t.text(),
  passingGradeThreshold: t.integer(),
  paymentExpirationDate: t.timestamp(),
  presentationMarkdown: t.varchar(),

  projectId: t
    .uuid()
    .references(() => contentProjects.id, { onDelete: 'set null' }),
  publishedAt: t.timestamp(),
  remainingSeats: t.integer(),

  requiresPayment: t.boolean().default(false).notNull(),
  startDate: t.timestamp({ withTimezone: true }),
  subtopic: t.text().notNull(),
  sumOfAllRating: t.integer().default(0).notNull(),
  teachingFormat: teachingFormatEnum()
    .default(TeachingFormat.SelfPaced)
    .notNull(),
  topic: t.text().notNull(),
}));

export const contentCoursesLocalized = content.table(
  'courses_localized',
  (t) => ({
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    goal: t.text().notNull(),
    language: t.varchar({ length: 10 }).notNull(),

    // Per translation
    name: t.text().notNull(),
    objectives: t.text().array().notNull(),
    rawDescription: t.text().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.language],
    }),
  }),
);

export const contentCourseParts = content.table(
  'course_parts',
  (t) => ({
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    partId: t.uuid().unique().notNull(),
    partIndex: t.integer().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.partId],
    }),
  }),
);

export const contentCoursePartsLocalized = content.table(
  'course_parts_localized',
  (t) => ({
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    language: t.varchar({ length: 10 }).notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    partId: t
      .uuid()
      .notNull()
      .references(() => contentCourseParts.partId, { onDelete: 'cascade' }),
    title: t.text().notNull(),
  }),
  (table) => ({
    fkCoursePartsLocalizedToCourseLocalized: foreignKey({
      columns: [table.courseId, table.language],
      foreignColumns: [
        contentCoursesLocalized.courseId,
        contentCoursesLocalized.language,
      ],
      name: 'course_parts_localized_to_course_localized_fk',
    }).onDelete('cascade'),
    fkCoursePartsLocalizedToCourseParts: foreignKey({
      columns: [table.courseId, table.partId],
      foreignColumns: [contentCourseParts.courseId, contentCourseParts.partId],
      name: 'course_parts_localized_to_course_parts_fk',
    }).onDelete('cascade'),
    pk: primaryKey({
      columns: [table.courseId, table.partId, table.language],
    }),
  }),
);

export const contentCourseChapters = content.table(
  'course_chapters',
  (t) => ({
    chapterId: t.uuid().unique().notNull(),
    chapterIndex: t.integer().notNull(),
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    partId: t
      .uuid()
      .notNull()
      .references(() => contentCourseParts.partId, { onDelete: 'cascade' }),
  }),
  (table) => ({
    fkCourseChaptersToCourseParts: foreignKey({
      columns: [table.courseId, table.partId],
      foreignColumns: [contentCourseParts.courseId, contentCourseParts.partId],
      name: 'course_chapters_to_course_parts_fk',
    }).onDelete('cascade'),
    pk: primaryKey({
      columns: [table.chapterId],
    }),
  }),
);

export const contentCourseChaptersLocalized = content.table(
  'course_chapters_localized',
  (t) => ({
    addressLine1: t.text('address_line_1'),
    addressLine2: t.text('address_line_2'),
    addressLine3: t.text('address_line_3'),
    availableSeats: t.integer(),
    chapterId: t
      .uuid()
      .notNull()
      .references(() => contentCourseChapters.chapterId, {
        onDelete: 'cascade',
      }),
    chatUrl: t.text(),
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    customTcDisclaimer: t.text(),
    endDate: t.timestamp(),
    isCourseConclusion: t.boolean().default(false).notNull(),
    isCourseExam: t.boolean().default(false).notNull(),
    isCourseReview: t.boolean().default(false).notNull(),
    isGdprCompliance: t.boolean().notNull().default(false),
    isInPerson: t.boolean().default(false).notNull(),
    isOnline: t.boolean().default(false).notNull(),
    isSingleTrialExam: t.boolean().default(false).notNull(),
    language: t.varchar({ length: 10 }).notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    liveLanguage: t.text(),
    liveUrl: t.text(),
    rateWeight: t.integer(),
    rawContent: t.text().notNull(),
    releaseDate: t.timestamp(),
    releasePlace: t.varchar({ length: 50 }),
    remainingSeats: t.integer(),
    sections: t.text().array().notNull(),
    startDate: t.timestamp(),
    timezone: t.text(),
    title: t.text().notNull(),
  }),
  (table) => ({
    fkCourseChaptersLocalizedToCourseLocalized: foreignKey({
      columns: [table.courseId, table.language],
      foreignColumns: [
        contentCoursesLocalized.courseId,
        contentCoursesLocalized.language,
      ],
      name: 'course_chapters_localized_to_course_localized_fk',
    }).onDelete('cascade'),
    pk: primaryKey({
      columns: [table.courseId, table.chapterId, table.language],
    }),
  }),
);

export const contentCourseTags = content.table(
  'course_tags',
  (t) => ({
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    tagId: t
      .integer()
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.tagId],
    }),
  }),
);

export const contentCoursesAssignment = content.table(
  'course_assignment',
  (t) => ({
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    description: t.text().notNull(),
    fileUrl: t.varchar({ length: 255 }).notNull(),
    id: t.uuid().primaryKey(),
    lastCommit: t.varchar({ length: 40 }).notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    mentor: t.varchar({ length: 50 }),
    name: t.varchar({ length: 50 }),
    telegramUrl: t.varchar({ length: 100 }),
  }),
);

// COURSE PAYMENTS
export const coursePaymentFormatEnum = pgNativeEnum(
  'course_payment_format',
  CoursePaymentFormat,
);

export const coursePaymentMethodEnum = pgNativeEnum(
  'course_payment_method',
  CoursePaymentMethod,
);

export const usersCoursePayment = users.table(
  'course_payment',
  (t) => ({
    amount: t.integer().notNull(),
    couponCode: t.varchar({ length: 20 }).references(() => couponCode.code),
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onUpdate: 'cascade',
      }),
    format: coursePaymentFormatEnum('format')
      .default(CoursePaymentFormat.InPerson)
      .notNull(),
    invoiceUrl: t.varchar({ length: 255 }),
    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    method: coursePaymentMethodEnum('method').notNull(),
    paymentId: t.varchar({ length: 255 }).notNull(),
    paymentStatus: t.varchar({ length: 30 }).notNull(),
    stripeInvoiceId: t.varchar({ length: 255 }),
    stripePaymentIntent: t.varchar({ length: 255 }),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.courseId, table.paymentId],
    }),
  }),
);

// COURSES PROGRESS

export const usersCourseUserChapter = users.table(
  'course_user_chapter',
  (t) => ({
    booked: t.boolean().default(false),
    chapterId: t
      .uuid()
      .notNull()
      .references(() => contentCourseChapters.chapterId, {
        onDelete: 'cascade',
      }),
    completedAt: t.timestamp({
      withTimezone: true,
    }),
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  }),
  (table) => ({
    courseIdIdx: index().on(table.courseId),
    pk: primaryKey({
      columns: [table.uid, table.courseId, table.chapterId],
    }),
    uidIdx: index().on(table.uid),
  }),
);

export const usersCourseProgress = users.table(
  'course_progress',
  (t) => ({
    affectedAssignmentId: t
      .uuid()
      .references(() => contentCoursesAssignment.id, { onDelete: 'cascade' }),
    appliedAssignmentIds: t.uuid().array(),
    assignmentGrade: t.integer(),
    assignmentSubmissionTime: t.timestamp({ withTimezone: true }),
    completedChaptersCount: t.integer().default(0).notNull(),
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    isSelectedForAssignment: t.boolean().default(false),
    isSelectedForFinalLesson: t.boolean().default(false),
    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    progressPercentage: t.integer().default(0).notNull(),
    ranking: t.integer(),
    startDate: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    totalScore: t.integer(),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.courseId],
    }),
  }),
);

export const usersCourseReview = users.table(
  'course_review',
  (t) => ({
    adminComment: t.text(),
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    difficulty: t.integer().default(0).notNull(),
    faithful: t.integer().default(0).notNull(),
    general: t.integer().default(0).notNull(),
    length: t.integer().default(0).notNull(),
    publicComment: t.text(),
    quality: t.integer().default(0).notNull(),
    recommend: t.integer().default(0).notNull(),
    teacherComment: t.text(),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.courseId],
    }),
  }),
);

// EVENTS

export const eventTypeEnum = pgNativeEnum('event_type', EventType);

export const contentEvents = content.table('events', (t) => ({
  addressLine1: t.text('address_line_1'),
  addressLine2: t.text('address_line_2'),
  addressLine3: t.text('address_line_3'),
  assetUrl: t.text(),
  availableSeats: t.integer(),
  bookInPerson: t.boolean().default(false),
  bookOnline: t.boolean().default(false),
  chatUrl: t.text(),
  courseRelated: t.text(),
  customTcDisclaimer: t.text(),
  description: t.text(),
  endDate: t.timestamp().notNull(),
  id: t.uuid().primaryKey(),
  isGdprCompliance: t.boolean().notNull().default(false),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  lastUpdated: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  liveUrl: t.text(),
  name: t.text(),
  path: t.varchar({ length: 255 }).notNull(),
  priceDollars: t.integer(),
  professor: t.uuid(),
  projectId: t
    .uuid()
    .references(() => contentProjects.id, { onDelete: 'set null' }),
  rawDescription: t.text(),
  remainingSeats: t.integer(),
  replayUrl: t.text(),
  startDate: t.timestamp().notNull(),
  timezone: t.text(),
  type: eventTypeEnum(),
  websiteUrl: t.text(),
}));

export const contentEventTags = content.table(
  'event_tags',
  (t) => ({
    eventId: t
      .uuid()
      .notNull()
      .references(() => contentEvents.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    tagId: t
      .integer()
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.eventId, table.tagId],
    }),
  }),
);

export const contentEventLanguages = content.table(
  'event_languages',
  (t) => ({
    eventId: t
      .uuid()
      .notNull()
      .references(() => contentEvents.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    language: t.varchar({ length: 10 }).notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.eventId, table.language],
    }),
  }),
);

export const usersUserEvent = users.table(
  'user_event',
  (t) => ({
    booked: t.boolean().default(false),
    eventId: t
      .uuid()
      .notNull()
      .references(() => contentEvents.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    withPhysical: t.boolean().default(false),
  }),
  (table) => ({
    eventIdIdx: index().on(table.eventId),
    pk: primaryKey({
      columns: [table.uid, table.eventId],
    }),
    uidIdx: index().on(table.uid),
  }),
);

export const usersEventPayment = users.table(
  'event_payment',
  (t) => ({
    amount: t.integer().notNull(),
    couponCode: t.varchar({ length: 20 }).references(() => couponCode.code),
    eventId: t
      .uuid()
      .notNull()
      .references(() => contentEvents.id, {
        onUpdate: 'cascade',
      }),
    invoiceUrl: t.varchar({ length: 255 }),
    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    method: coursePaymentMethodEnum('method').notNull(),
    paymentId: t.varchar({ length: 255 }).notNull(),
    paymentStatus: t.varchar({ length: 30 }).notNull(),
    stripeInvoiceId: t.varchar({ length: 255 }),
    stripePaymentIntent: t.varchar({ length: 255 }),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    withPhysical: t.boolean().default(false),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.eventId, table.paymentId],
    }),
  }),
);

// TUTORIALS

export const contentTutorials = content.table('tutorials', (t) => ({
  category: t.varchar({ length: 255 }).notNull(),
  creditLink: t.text(),
  id: t.uuid().primaryKey().notNull(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

  lastUpdated: t
    .timestamp({
      withTimezone: true,
    })
    .defaultNow()
    .notNull(),

  level: t.varchar({ length: 255 }).notNull(),
  logoUrl: t.text().notNull().default(''),

  name: t.varchar({ length: 255 }).notNull(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),
  path: t.varchar({ length: 255 }).notNull(),
  professorId: t.uuid().references(() => contentProfessors.id, {
    onUpdate: 'cascade',
  }),
  projectId: t
    .uuid()
    .references(() => contentProjects.id, { onDelete: 'set null' }),
  subcategory: t.varchar({ length: 255 }),
}));

export const contentTutorialsLocalized = content.table(
  'tutorials_localized',
  (t) => ({
    description: t.text(),
    language: t.varchar({ length: 10 }).notNull(),
    rawContent: t.text().notNull(),
    title: t.text().notNull(),
    tutorialId: t
      .uuid()
      .notNull()
      .references(() => contentTutorials.id, {
        onDelete: 'cascade',
      }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.tutorialId, table.language],
    }),
  }),
);

export const contentTutorialTags = content.table(
  'tutorial_tags',
  (t) => ({
    tagId: t
      .integer()
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
    tutorialId: t
      .uuid()
      .notNull()
      .references(() => contentTutorials.id, {
        onDelete: 'cascade',
      }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.tutorialId, table.tagId],
    }),
  }),
);

export const contentTutorialLikesDislikes = content.table(
  'tutorial_likes_dislikes',
  (t) => ({
    liked: t.boolean().notNull(),
    tutorialId: t
      .uuid()
      .notNull()
      .references(() => contentTutorials.id, {
        onDelete: 'cascade',
      }),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }), // true = liked, false = disliked
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.tutorialId, table.uid],
    }),
  }),
);

// QUIZZES AND EXAMS

export const contentQuizQuestions = content.table('quiz_questions', (t) => ({
  author: t.varchar({ length: 255 }),

  chapterId: t
    .uuid()
    .notNull()
    .references(() => contentCourseChapters.chapterId, {
      onDelete: 'cascade',
    }),

  courseId: t
    .varchar({ length: 100 })
    .notNull()
    .references(() => contentCourses.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),

  difficulty: t.varchar({ length: 255 }).notNull(),

  disabled: t.boolean().default(false),
  duration: t.integer(),
  id: t.uuid().primaryKey().notNull(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

  lastUpdated: t
    .timestamp({
      withTimezone: true,
    })
    .defaultNow()
    .notNull(),
}));

export const contentQuizQuestionsLocalized = content.table(
  'quiz_questions_localized',
  (t) => ({
    answer: t.text().notNull(),
    explanation: t.text(),
    language: t.varchar({ length: 10 }).notNull(),
    question: t.text().notNull(),
    quizQuestionId: t
      .uuid()
      .notNull()
      .references(() => contentQuizQuestions.id, { onDelete: 'cascade' }),
    wrongAnswers: t.text().array().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.quizQuestionId, table.language],
    }),
  }),
);

export const contentQuizAnswers = content.table(
  'quiz_answers',
  (t) => ({
    correct: t.boolean().notNull(),

    order: t.integer().notNull(),
    quizQuestionId: t
      .uuid()
      .notNull()
      .references(() => contentQuizQuestions.id, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.quizQuestionId, table.order],
    }),
  }),
);

export const contentQuizAnswersLocalized = content.table(
  'quiz_answers_localized',
  (t) => ({
    language: t.varchar({ length: 10 }).notNull(),
    order: t.integer().notNull(),
    quizQuestionId: t.uuid().notNull(),
    text: t.text().notNull(),
  }),
  (table) => ({
    parent: foreignKey({
      columns: [table.quizQuestionId, table.order],
      foreignColumns: [
        contentQuizAnswers.quizQuestionId,
        contentQuizAnswers.order,
      ],
      name: 'quiz_answers_localized_to_quiz_answers_fk',
    }).onDelete('cascade'),
    pk: primaryKey({
      columns: [table.quizQuestionId, table.order, table.language],
    }),
  }),
);

export const contentQuizQuestionTags = content.table(
  'quiz_question_tags',
  (t) => ({
    quizQuestionId: t
      .uuid()
      .notNull()
      .references(() => contentQuizQuestions.id, { onDelete: 'cascade' }),
    tagId: t
      .integer()
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.quizQuestionId, table.tagId],
    }),
  }),
);

export const usersExamQuestions = users.table('exam_questions', (t) => ({
  examId: t
    .uuid()
    .notNull()
    .references(() => usersExamAttempts.id, { onDelete: 'cascade' }),
  id: t.uuid().defaultRandom().primaryKey().notNull(),
  questionId: t
    .uuid()
    .notNull()
    .references(() => contentQuizQuestions.id, { onDelete: 'cascade' }),
}));

export const usersExamAnswers = users.table('exam_answers', (t) => ({
  order: t.integer(),
  questionId: t
    .uuid()
    .primaryKey()
    .notNull()
    .references(() => usersExamQuestions.id, { onDelete: 'cascade' }),
}));

export const examTypeEnum = pgNativeEnum('exam_type', ExamType);

export const usersExamAttempts = users.table('exam_attempts', (t) => ({
  // chapterId mandatory for single trial exams
  chapterId: t.uuid().references(() => contentCourseChapters.chapterId, {
    onDelete: 'cascade',
  }),
  courseId: t
    .varchar({ length: 100 })
    .notNull()
    .references(() => contentCourses.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  examType: examTypeEnum().default(ExamType.Final).notNull(),
  finalized: t.boolean().default(false).notNull(),
  finishedAt: t.timestamp({ withTimezone: true }),
  id: t.uuid().defaultRandom().primaryKey().notNull(),

  language: t.varchar({ length: 10 }).notNull(),
  score: t.integer().default(0),

  startedAt: t.timestamp({ withTimezone: true }).notNull(),
  succeeded: t.boolean().default(false).notNull(),

  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
}));

export const userExamTimestamps = users.table('exam_timestamps', (t) => ({
  blockHash: t.varchar({ length: 64 }),
  blockHeight: t.integer(),
  blockTimestamp: t.bigint({ mode: 'bigint' }),

  // Is the timestamp is confirmed
  confirmed: t.boolean().default(false).notNull(),
  confirmedAt: t.timestamp(), // Text to timestamp
  courseId: t
    .varchar({ length: 100 })
    .references(() => contentCourses.id, { onDelete: 'cascade' }), // Signed message

  createdAt: t.timestamp().defaultNow().notNull(), // OpenTimestamps proof

  // Reference to exam attempt (users.exam_attempts.exam_type = final)
  examAttemptId: t
    .uuid()
    .references(() => usersExamAttempts.id, { onDelete: 'cascade' }), // Hash of the signature (ots target)
  hash: t.varchar({ length: 64 }).notNull(),
  id: t.uuid().defaultRandom().primaryKey().notNull(),
  imgKey: t.varchar({ length: 255 }),
  ots: blob('ots').notNull(),

  // If pdf/image has been generated
  pdfKey: t.varchar({ length: 255 }),
  sig: t.text().notNull(),

  // Timestamp data
  txt: t.text().notNull(),

  // Reference to course progress (users.exam_attempts.exam_type = single_trial)
  //  score is stored in users.course_progress.total_score (it aggregates multiple exam_attempts)
  //  threshold is stored in content.courses.passing_grade_threshold
  uid: t.uuid().references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  updatedAt: t.timestamp().defaultNow().notNull(),
}));

export const usersQuizAttempts = users.table(
  'quiz_attempts',
  (t) => ({
    chapterId: t
      .uuid()
      .notNull()
      .references(() => contentCourseChapters.chapterId, {
        onDelete: 'cascade',
      }),
    correctAnswersCount: t.integer().notNull(),

    doneAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

    questionsCount: t.integer().notNull(),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.chapterId],
    }),
  }),
);

export const generalPaymentItemEnum = pgNativeEnum(
  'payment_item',
  GeneralPaymentItem,
);

// Payment
export const usersGeneralPayment = users.table(
  'general_payment',
  (t) => ({
    amount: t.integer().notNull(),
    couponCode: t.varchar({ length: 20 }).references(() => couponCode.code),
    invoiceUrl: t.varchar({ length: 255 }),
    item: generalPaymentItemEnum('item').notNull(),
    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    method: coursePaymentMethodEnum('method').notNull(),
    paymentId: t.varchar({ length: 255 }).notNull(),
    paymentStatus: t.varchar({ length: 30 }).notNull(),
    stripeInvoiceId: t.varchar({ length: 255 }),
    stripePaymentIntent: t.varchar({ length: 255 }),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.item, table.paymentId],
    }),
  }),
);

// LABS

export const contentLabs = content.table('labs', (t) => ({
  id: t.uuid().primaryKey().defaultRandom().notNull(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

  lastUpdated: t
    .timestamp({
      withTimezone: true,
    })
    .defaultNow()
    .notNull(),
  path: t.varchar({ length: 255 }).unique().notNull(),
  professorId: t
    .uuid()
    .notNull()
    .references(() => contentProfessors.id, {
      onUpdate: 'cascade',
    }),
  studentCount: t.integer().default(0).notNull(),
  studyGroup: t.varchar({ length: 20 }),
  telegramUrl: t.varchar({ length: 100 }),
}));

export const contentLabSession = content.table('labs_sessions', (t) => ({
  endDate: t.timestamp().notNull(),
  id: t.uuid().primaryKey().defaultRandom().notNull(),
  labId: t
    .uuid()
    .notNull()
    .references(() => contentLabs.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),

  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  liveUrl: t.varchar({ length: 255 }),
  rawContent: t.text().notNull(),
  startDate: t.timestamp().notNull(),
  title: t.varchar({ length: 100 }),
}));

// PROFESSORS

export const contentContributors = content.table('contributors', (t) => ({
  id: t.varchar({ length: 20 }).primaryKey().notNull(),
}));

export const contentProfessors = content.table('professors', (t) => ({
  affiliations: t.uuid().array(),
  company: t.varchar({ length: 255 }),
  githubUrl: t.text(),
  id: t.uuid().primaryKey().notNull(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),

  lastUpdated: t
    .timestamp({
      withTimezone: true,
    })
    .defaultNow()
    .notNull(),

  // Tips
  lightningAddress: t.text(),
  lnurlPay: t.text(),

  name: t.varchar({ length: 255 }).unique().notNull(),
  nostr: t.text(),
  path: t.varchar({ length: 255 }).notNull(),
  paynym: t.text(),
  silentPayment: t.text(),
  tipsUrl: t.text(),
  twitterUrl: t.text(),

  // Links
  websiteUrl: t.text(),
}));

export const contentProfessorsLocalized = content.table(
  'professors_localized',
  (t) => ({
    // Per translation
    bio: t.text(),
    language: t.varchar({ length: 10 }).notNull(),
    professorId: t
      .uuid()
      .notNull()
      .references(() => contentProfessors.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    shortBio: t.text(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.professorId, table.language],
    }),
  }),
);

export const contentProfessorTags = content.table(
  'professor_tags',
  (t) => ({
    professorId: t
      .uuid()
      .notNull()
      .references(() => contentProfessors.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    tagId: t
      .integer()
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.professorId, table.tagId],
    }),
  }),
);

export const contentCourseProfessors = content.table(
  'course_professors',
  (t) => ({
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    isCoordinator: t.boolean().notNull().default(true),
    professorId: t.uuid().references(() => contentProfessors.id, {
      onUpdate: 'cascade',
    }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.professorId],
    }),
  }),
);

export const contentCourseChaptersLocalizedProfessors = content.table(
  'course_chapters_localized_professors',
  (t) => ({
    chapterId: t
      .uuid()
      .notNull()
      .references(() => contentCourseChapters.chapterId, {
        onDelete: 'cascade',
      }),
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    language: t.varchar({ length: 10 }).notNull(),
    professorId: t.uuid().references(() => contentProfessors.id, {
      onUpdate: 'cascade',
    }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [
        table.professorId,
        table.courseId,
        table.chapterId,
        table.language,
      ],
    }),
  }),
);

export const contentVideos = content.table('videos', (t) => ({
  courseId: t.varchar({ length: 100 }).references(() => contentCourses.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  id: t.uuid().primaryKey().notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

export const videoProviderEnum = pgNativeEnum('video_provider', VideoProvider);

export const contentVideosLocalized = content.table(
  'videos_localized',
  (t) => ({
    id: t
      .uuid()
      .references(() => contentVideos.id, { onDelete: 'cascade' })
      .notNull(),
    idFromProvider: t.varchar({ length: 40 }),
    language: t.varchar({ length: 10 }).notNull(),
    provider: videoProviderEnum().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.id, table.language, table.provider],
    }),
  }),
);

export const couponCode = content.table('coupon_code', (t) => ({
  code: t.varchar({ length: 20 }).primaryKey().notNull(),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  deletedAt: t.timestamp({ withTimezone: true }),
  itemId: t.varchar({ length: 100 }).notNull(),
  maxUses: t.integer().default(1).notNull(),
  reductionPercentage: t.integer(),
  uid: t.uuid().references(() => usersAccounts.uid, {
    onDelete: 'cascade',
  }),
  uses: t.integer().default(0).notNull(), // Paranoid delete
}));

/**
 * Custom drizzle type for bytea columns.
 */

export const tokenTypeEnum = pgNativeEnum('token_type', TokenType);

export const token = users.table('tokens', (t) => ({
  // When the token was consumed (used)
  consumedAt: t.timestamp(),
  // Arbitrary data to store with the token
  data: t.varchar({ length: 255 }),
  expiresAt: t.timestamp().notNull(),
  id: t.uuid().primaryKey().defaultRandom(),
  type: tokenTypeEnum().notNull(),
  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, {
      onDelete: 'cascade',
    }),
}));

/**
 * Table to store coordinates for events (bound by address_line_1).
 */
export const contentEventLocation = content.table('event_locations', (t) => ({
  lat: t.doublePrecision().notNull(), // OSM place_id
  lng: t.doublePrecision().notNull(), // address_line_1 in the events table
  name: t.text().primaryKey(),
  placeId: t.integer().notNull(),
}));

export const contentProofreading = content.table(
  'proofreading',
  (t) => ({
    courseId: t.varchar({ length: 100 }).references(() => contentCourses.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    id: t.uuid().primaryKey().defaultRandom(),

    language: t.varchar({ length: 10 }).notNull(),
    lastContributionDate: t.timestamp({
      withTimezone: true,
    }),
    resourceId: t.uuid().references(() => contentResources.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    reward: t.integer(),
    tutorialId: t.uuid().references(() => contentTutorials.id, {
      onDelete: 'cascade',
    }),
    urgency: t.integer(),
  }),
  // TODO add index when drizzle bug fixed: https://github.com/drizzle-team/drizzle-kit-mirror/issues/486
  // (table) => {
  //   return {
  //     compositeIdx: index('proofreading_composite_idx')
  //       .on(
  //         table.courseId.asc(),
  //         table.tutorialId.asc(),
  //         table.resourceId.asc(),
  //       )
  //       .concurrently(),
  //   };
  // },
);

export const contentProofreadingContributor = content.table(
  'proofreading_contributor',
  (t) => ({
    contributorId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentContributors.id, { onDelete: 'cascade' }),
    order: t.integer().notNull(),
    proofreadingId: t
      .uuid()
      .notNull()
      .references(() => contentProofreading.id, {
        onDelete: 'cascade',
      }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.proofreadingId, table.contributorId],
    }),
  }),
);

export const notificationTypeEnum = pgNativeEnum(
  'notification_type',
  NotificationType,
);

export const studentGroupEnum = pgNativeEnum('student_group', StudentGroup);

export const usersNotifications = users.table('notifications', (t) => ({
  blogId: t.uuid().references(() => contentBlogs.id, { onDelete: 'set null' }),
  chapterId: t.uuid().references(() => contentCourseChapters.chapterId, {
    onDelete: 'set null',
  }),
  content: t.text(),
  courseId: t.varchar({ length: 100 }).references(() => contentCourses.id, {
    onDelete: 'set null',
  }),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  eventId: t
    .uuid()
    .references(() => contentEvents.id, { onDelete: 'set null' }),
  id: t.uuid().primaryKey().defaultRandom(),
  type: notificationTypeEnum().notNull(),
}));

export const usersUserNotificationStatus = users.table(
  'user_notification_status',
  (t) => ({
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    notificationId: t
      .uuid()
      .notNull()
      .references(() => usersNotifications.id, { onDelete: 'cascade' }),
    readDate: t.timestamp({ withTimezone: true }),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  }),
  (table) => [primaryKey({ columns: [table.uid, table.notificationId] })],
);

export const usersScheduledCourseNotifications = users.table(
  'scheduled_course_notifications',
  (t) => ({
    content: t.text().notNull(),
    courseId: t
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
      }),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    id: t.uuid().primaryKey().defaultRandom(),
    isPublished: t.boolean().default(false).notNull(),
    notificationId: t
      .uuid()
      .notNull()
      .references(() => usersNotifications.id, { onDelete: 'set null' }),
    professorId: t
      .uuid()
      .notNull()
      .references(() => contentProfessors.id, { onDelete: 'cascade' }),
    scheduledAt: t.timestamp({ withTimezone: true }).notNull(),
    studentGroup: studentGroupEnum().notNull(),
    timezone: t.varchar({ length: 50 }).notNull(),
    type: notificationTypeEnum().notNull(),
    updatedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
);
