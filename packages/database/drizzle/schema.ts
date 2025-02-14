import {
  customType,
  foreignKey,
  index,
  pgEnum,
  pgSchema,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core';

const blob = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return 'bytea';
  },
});

export const users = pgSchema('users');
export const content = pgSchema('content');

// ACCOUNTS

export const userRoleEnum = pgEnum('user_role', [
  'student',
  'professor',
  'community',
  'admin',
  'superadmin',
]);

export const usersAccounts = users.table('accounts', (t) => ({
  uid: t.uuid().defaultRandom().primaryKey().notNull(),
  username: t.varchar({ length: 255 }).unique().notNull(),
  displayName: t.varchar({ length: 255 }),
  certificateName: t.varchar({ length: 255 }),
  picture: t.uuid(),
  email: t.varchar({ length: 255 }).unique(),
  role: userRoleEnum().default('student').notNull(),
  lastEmailChangeRequest: t.timestamp({ withTimezone: true }),
  currentEmailChecked: t.boolean().default(false).notNull(),
  passwordHash: t.varchar({ length: 255 }),
  contributorId: t.varchar({ length: 20 }).unique().notNull(),
  professorId: t
    .integer()
    .unique()
    .references(() => contentProfessors.id),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

// CAREER

export const careerLanguageLevelEnum = pgEnum('career_language_level', [
  'beginner',
  'elementary',
  'intermediate',
  'advanced',
  'fluent',
]);

export const careerRoleLevelEnum = pgEnum('career_role_level', [
  'student',
  'junior',
  'mid',
  'senior',
]);

export const careerCompanySizeEnum = pgEnum('career_company_size', [
  '1To10',
  '11To40',
  '41To100',
  '100More',
]);

export const careerRemoteEnum = pgEnum('career_remote', [
  'yes',
  'sometimes',
  'no',
]);

export const jobNameEnum = pgEnum('job_name', [
  'fullStackDeveloper',
  'backendEngineer',
  'frontendEngineer',
  'mobileAppDeveloper',
  'devOpsEngineer',
  'cloudInfrastructureEngineer',
  'dataEngineer',
  'protocolEngineer',
  'technicalProductManager',
  'technicalSupportEngineer',
  'cybersecurity',
  'cryptographer',
  'businessDevelopmentManager',
  'sales',
  'businessAnalyst',
  'revenueManager',
  'productManager',
  'uiUxDesigner',
  'uxResearcher',
  'brandStrategist',
  'graphicDesigner',
  'marketingManager',
  'socialMediaManager',
  'communityManager',
  'publicRelationsManager',
  'eventCoordinator',
  'seoSpecialist',
  'operationsManager',
  'customerSupportSpecialist',
  'customerSuccessManager',
  'logisticManager',
  'researcher',
  'economicAnalyst',
  'educator',
  'contentWriter',
  'technicalWriter',
  'complianceOfficer',
  'amlKycSpecialist',
  'riskAnalyst',
  'accountingManager',
  'bitcoinInvestmentAnalyst',
  'hrSpecialist',
  'legalContractSpecialist',
  'miningEngineer',
  'miningOperationsManager',
]);

export const jobCategoryEnum = pgEnum('job_category', [
  'technicalRoles',
  'businessRoles',
  'productDesign',
  'marketingCommunity',
  'operationsSupport',
  'researchEducation',
  'financeCompliance',
  'more',
]);

export const usersCareerProfiles = users.table('career_profiles', (t) => ({
  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .unique(),
  id: t.uuid().primaryKey().notNull(),

  // Primary infos
  firstName: t.text(),
  lastName: t.text(),
  country: t.text(),

  // Contact
  email: t.text(),
  linkedin: t.text(),
  github: t.text(),
  telegram: t.text(),
  otherContact: t.text(),

  // Bitcoin related experiences
  isBitcoinCommunityParticipant: t.boolean().default(false).notNull(),
  bitcoinCommunityText: t.text(),
  isBitcoinProjectParticipant: t.boolean().default(false).notNull(),
  bitcoinProjectText: t.text(),

  // Job preferences
  isAvailableFullTime: t.boolean().default(true).notNull(),
  remoteWorkPreference: careerRemoteEnum().default('yes').notNull(),
  expectedSalary: t.text(),
  availabilityStart: t.text(),

  // CV/Resume and Motivation Letter
  cvUrl: t.text(),
  motivationLetter: t.text(),

  // Agreement
  areTermsAccepted: t.boolean().default(false).notNull(),
  allowReceivingEmails: t.boolean().default(false).notNull(),

  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  editedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
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
    roleId: t
      .uuid()
      .notNull()
      .references(() => usersJobTitles.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    level: careerRoleLevelEnum().notNull(),
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
  id: t.uuid().primaryKey().notNull(),
  name: jobNameEnum().notNull(),
  category: jobCategoryEnum().notNull(),
}));

// BLOGS

export const contentBlogs = content.table('blogs', (t) => ({
  id: t.uuid().primaryKey(),
  path: t.varchar({ length: 255 }).unique().notNull(),

  category: t.varchar({ length: 255 }).notNull(),

  author: t.varchar({ length: 255 }),

  lastUpdated: t
    .timestamp({
      withTimezone: true,
    })
    .defaultNow()
    .notNull(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  date: t.timestamp({ withTimezone: true }).notNull(),
}));

export const contentBlogsLocalized = content.table(
  'blogs_localized',
  (t) => ({
    blogId: t
      .uuid()
      .notNull()
      .references(() => contentBlogs.id),
    language: t.varchar({ length: 10 }).notNull(),
    title: t.text().notNull(),
    description: t.text(),
    rawContent: t.text().notNull(),
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
  id: t.uuid().defaultRandom().primaryKey().notNull(),
  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  publicKey: t.text().unique().notNull(),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

// API KEYS

export const usersApiKeys = users.table('api_keys', (t) => ({
  id: t.uuid().defaultRandom().primaryKey().notNull(),
  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  revokedAt: t.timestamp({ withTimezone: true }),
  expiresAt: t.timestamp({ withTimezone: true }),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

// BCERT

export const contentBCertificateExam = content.table(
  'b_certificate_exam',
  (t) => ({
    id: t.uuid().primaryKey().notNull(),
    path: t.varchar({ length: 255 }).unique().notNull(),

    date: t.timestamp().notNull(),
    location: t.text().notNull(),
    minScore: t.integer().notNull(),
    duration: t.integer().notNull(),

    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    lastCommit: t.varchar({ length: 40 }).notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
);

export const usersBCertificateResults = users.table(
  'b_certificate_results',
  (t) => ({
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    bCertificateExam: t
      .uuid()
      .notNull()
      .references(() => contentBCertificateExam.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    category: t.varchar().notNull(),
    score: t.integer().notNull(),

    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    lastCommit: t.varchar({ length: 40 }).notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
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
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    bCertificateExam: t
      .uuid()
      .notNull()
      .references(() => contentBCertificateExam.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    pdfKey: t.varchar({ length: 255 }),
    imgKey: t.varchar({ length: 255 }),
    txtKey: t.varchar({ length: 255 }),
    txtOtsKey: t.varchar({ length: 255 }),

    createdAt: t.timestamp().defaultNow().notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.bCertificateExam],
    }),
  }),
);

// RESOURCES

export const contentResources = content.table(
  'resources',
  (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
    category: t.varchar({ length: 255 }).notNull(),
    path: t.varchar({ length: 255 }).notNull(),
    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    lastCommit: t.varchar({ length: 40 }).notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (table) => ({
    unq: unique().on(table.category, table.path),
  }),
);

export const contentTags = content.table('tags', (t) => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  name: t.varchar({ length: 255 }).unique().notNull(),
}));

export const contentResourceTags = content.table(
  'resource_tags',
  (t) => ({
    resourceId: t
      .integer()
      .notNull()
      .references(() => contentResources.id, { onDelete: 'cascade' }),
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

export const betTypeEnum = pgEnum('bet_type', [
  'visual content',
  'educational content',
]);

export const contentBet = content.table('bet', (t) => ({
  resourceId: t
    .integer()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  projectId: t
    .uuid()
    .references(() => contentProjects.id, { onDelete: 'set null' }),
  type: betTypeEnum().notNull(),
  downloadUrl: t.text().notNull(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),
}));

export const contentBetViewUrl = content.table(
  'bet_view_url',
  (t) => ({
    betId: t
      .integer()
      .notNull()
      .references(() => contentBet.resourceId, { onDelete: 'cascade' }),
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
      .integer()
      .notNull()
      .references(() => contentBet.resourceId, { onDelete: 'cascade' }),
    language: t.varchar({ length: 10 }).notNull(),

    // Per translation
    name: t.text().notNull(),
    description: t.text().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.betId, table.language],
    }),
  }),
);

// BOOKS

export const contentBooks = content.table('books', (t) => ({
  resourceId: t
    .integer()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  level: t.varchar({ length: 255 }),
  author: t.text().notNull(),
  websiteUrl: t.text(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),
}));

export const contentBooksLocalized = content.table(
  'books_localized',
  (t) => ({
    bookId: t
      .integer()
      .notNull()
      .references(() => contentBooks.resourceId, { onDelete: 'cascade' }),
    language: t.varchar({ length: 10 }).notNull(),
    original: t.boolean().notNull(),

    // Per translation
    title: t.text().notNull(),
    translator: t.text(),
    description: t.text(),
    publisher: t.varchar({ length: 255 }),
    publicationYear: t.integer(),
    cover: t.text(),
    summaryText: t.text(),
    summaryContributorId: t.varchar({ length: 20 }),

    // Links
    shopUrl: t.text(),
    downloadUrl: t.text(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.bookId, table.language],
    }),
  }),
);

// PROJECTS

export const contentProjects = content.table('projects', (t) => ({
  id: t.uuid().primaryKey().unique(),
  resourceId: t
    .integer()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  name: t.text().notNull(),
  category: t.varchar({ length: 255 }).notNull(),
  languages: t.varchar({ length: 255 }).array(),
  addressLine1: t.text('address_line_1'),
  addressLine2: t.text('address_line_2'),
  addressLine3: t.text('address_line_3'),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),

  // Links
  websiteUrl: t.text(),
  twitterUrl: t.text(),
  githubUrl: t.text(),
  nostr: t.text(),
}));

export const contentProjectsLocalized = content.table(
  'projects_localized',
  (t) => ({
    id: t
      .uuid()
      .references(() => contentProjects.id, { onDelete: 'cascade' })
      .notNull(),
    language: t.varchar({ length: 10 }).notNull(),

    // Per translation
    description: t.text(),
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
    placeId: t.integer().notNull(), // OSM place_id
    name: t.text().primaryKey(), // address_line_1 in the projects table
    lat: t.doublePrecision().notNull(),
    lng: t.doublePrecision().notNull(),
  }),
);

// CONFERENCES

export const contentConferences = content.table('conferences', (t) => ({
  resourceId: t
    .integer()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  projectId: t
    .uuid()
    .references(() => contentProjects.id, { onDelete: 'set null' }),
  name: t.text().notNull(),
  description: t.text(),
  year: t.text().notNull(),
  languages: t.varchar({ length: 255 }).array(),
  location: t.text().notNull(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),

  // Links
  websiteUrl: t.text(),
  twitterUrl: t.text(),
}));

export const contentConferencesStages = content.table(
  'conferences_stages',
  (t) => ({
    stageId: t.varchar().primaryKey().notNull(),
    conferenceId: t
      .integer()
      .notNull()
      .references(() => contentConferences.resourceId, { onDelete: 'cascade' }),
    name: t.text().notNull(),
  }),
);

export const contentConferenceStageVideos = content.table(
  'conferences_stages_videos',
  (t) => ({
    videoId: t.varchar().primaryKey().notNull(),
    stageId: t
      .varchar()
      .notNull()
      .references(() => contentConferencesStages.stageId, {
        onDelete: 'cascade',
      }),
    name: t.text().notNull(),
    rawContent: t.text().notNull(),
  }),
);

// LEGAL INFORMATION

export const contentLegals = content.table(
  'legals',
  (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
    path: t.varchar({ length: 255 }).unique().notNull(),

    name: t.varchar({ length: 255 }).notNull(),

    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    lastCommit: t.varchar({ length: 40 }).notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
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
    title: t.text().notNull(),
    rawContent: t.text().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.id, table.language],
    }),
  }),
);

// MOVIES

export const contentMovies = content.table('movies', (t) => ({
  resourceId: t
    .integer()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  id: t.uuid().unique().notNull(),

  language: t.varchar({ length: 10 }).notNull(),

  title: t.text().notNull(),
  description: t.text(),
  duration: t.integer(),
  publicationYear: t.integer(),

  author: t.text().notNull(),

  // Links
  platform: t.text().notNull(),
  trailer: t.text().notNull(),
}));

// NEWSLETTER

export const contentNewsletters = content.table('newsletters', (t) => ({
  resourceId: t
    .integer()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),

  id: t.uuid().unique().notNull(),
  level: t.varchar({ length: 255 }),
  author: t.text().notNull(),
  websiteUrl: t.text(),
  publication_date: t.text(),
  title: t.text().notNull(),
  tags: t.text().array(),
  contributors: t.text().array(),
  language: t.varchar({ length: 10 }).notNull(),
  description: t.text(),
}));

// PODCASTS

export const contentPodcasts = content.table('podcasts', (t) => ({
  resourceId: t
    .integer()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  language: t.varchar({ length: 10 }).notNull(),

  name: t.text().notNull(),
  host: t.text().notNull(),
  description: t.text(),

  // Links
  websiteUrl: t.text(),
  twitterUrl: t.text(),
  podcastUrl: t.text(),
  nostr: t.text(),
}));

// GLOSSARY WORDS

export const contentGlossaryWords = content.table('glossary_words', (t) => ({
  resourceId: t
    .integer()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  originalWord: t.text().notNull(),
  fileName: t.text().notNull(),
  relatedWords: t.varchar({ length: 255 }).array(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),
}));

export const contentGlossaryWordsLocalized = content.table(
  'glossary_words_localized',
  (t) => ({
    glossaryWordId: t
      .integer()
      .notNull()
      .references(() => contentGlossaryWords.resourceId, {
        onDelete: 'cascade',
      }),
    language: t.varchar({ length: 10 }).notNull(),

    // Per translation
    term: t.text().notNull(),
    definition: t.text().notNull(),
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
    resourceId: t
      .integer()
      .primaryKey()
      .notNull()
      .references(() => contentResources.id, { onDelete: 'cascade' }),
    id: t.uuid().unique().notNull(),

    language: t.varchar({ length: 10 }).notNull(),

    name: t.text().notNull(),
    description: t.text(),

    // Links
    channel: t.text().notNull(),
    trailer: t.text().notNull(),
  }),
);

// COURSES

export const courseFormatEnum = pgEnum('course_format', [
  'online',
  'inperson',
  'hybrid',
]);

export const contentCourses = content.table('courses', (t) => ({
  id: t.varchar({ length: 20 }).primaryKey().notNull(),
  isArchived: t.boolean().default(false).notNull(),

  level: t.varchar({ length: 255 }).notNull(),
  hours: t.doublePrecision().notNull(),
  topic: t.text().notNull(),
  subtopic: t.text().notNull(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),

  requiresPayment: t.boolean().default(false).notNull(),
  paymentExpirationDate: t.timestamp(),
  publishedAt: t.timestamp(),
  format: courseFormatEnum().default('online').notNull(),
  onlinePriceDollars: t.integer(),
  inpersonPriceDollars: t.integer(),
  paidDescription: t.text(),
  paidVideoLink: t.text(),
  startDate: t.timestamp({ withTimezone: true }),
  endDate: t.timestamp({ withTimezone: true }),
  contact: t.varchar({ length: 255 }),
  availableSeats: t.integer().default(0),
  remainingSeats: t.integer(),

  isPlanbSchool: t.boolean().default(false).notNull(),
  planbSchoolMarkdown: t.varchar(),

  lastUpdated: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  numberOfRating: t.integer().default(0).notNull(),
  sumOfAllRating: t.integer().default(0).notNull(),
}));

export const contentCoursesLocalized = content.table(
  'courses_localized',
  (t) => ({
    courseId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    language: t.varchar({ length: 10 }).notNull(),

    // Per translation
    name: t.text().notNull(),
    goal: t.text().notNull(),
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
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    partIndex: t.integer().notNull(),
    partId: t.uuid().unique().notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
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
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    partId: t
      .uuid()
      .notNull()
      .references(() => contentCourseParts.partId, { onDelete: 'cascade' }),
    language: t.varchar({ length: 10 }).notNull(),
    title: t.text().notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.partId, table.language],
    }),
    fkCoursePartsLocalizedToCourseParts: foreignKey({
      columns: [table.courseId, table.partId],
      foreignColumns: [contentCourseParts.courseId, contentCourseParts.partId],
      name: 'course_parts_localized_to_course_parts_fk',
    }).onDelete('cascade'),
    fkCoursePartsLocalizedToCourseLocalized: foreignKey({
      columns: [table.courseId, table.language],
      foreignColumns: [
        contentCoursesLocalized.courseId,
        contentCoursesLocalized.language,
      ],
      name: 'course_parts_localized_to_course_localized_fk',
    }).onDelete('cascade'),
  }),
);

export const contentCourseChapters = content.table(
  'course_chapters',
  (t) => ({
    courseId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    chapterIndex: t.integer().notNull(),
    partId: t
      .uuid()
      .notNull()
      .references(() => contentCourseParts.partId, { onDelete: 'cascade' }),
    chapterId: t.uuid().unique().notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.chapterId],
    }),
    fkCourseChaptersToCourseParts: foreignKey({
      columns: [table.courseId, table.partId],
      foreignColumns: [contentCourseParts.courseId, contentCourseParts.partId],
      name: 'course_chapters_to_course_parts_fk',
    }).onDelete('cascade'),
  }),
);

export const contentCourseChaptersLocalized = content.table(
  'course_chapters_localized',
  (t) => ({
    courseId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    chapterId: t
      .uuid()
      .notNull()
      .references(() => contentCourseChapters.chapterId, {
        onDelete: 'cascade',
      }),
    language: t.varchar({ length: 10 }).notNull(),
    releasePlace: t.varchar({ length: 50 }),
    isOnline: t.boolean().default(false).notNull(),
    isInPerson: t.boolean().default(false).notNull(),
    isCourseReview: t.boolean().default(false).notNull(),
    isCourseExam: t.boolean().default(false).notNull(),
    isCourseConclusion: t.boolean().default(false).notNull(),
    startDate: t.timestamp(),
    endDate: t.timestamp(),
    timezone: t.text(),
    addressLine1: t.text('address_line_1'),
    addressLine2: t.text('address_line_2'),
    addressLine3: t.text('address_line_3'),
    liveUrl: t.text(),
    chatUrl: t.text(),
    availableSeats: t.integer(),
    remainingSeats: t.integer(),
    liveLanguage: t.text(),
    title: t.text().notNull(),
    sections: t.text().array().notNull(),
    rawContent: t.text().notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.chapterId, table.language],
    }),
    fkCourseChaptersLocalizedToCourseLocalized: foreignKey({
      columns: [table.courseId, table.language],
      foreignColumns: [
        contentCoursesLocalized.courseId,
        contentCoursesLocalized.language,
      ],
      name: 'course_chapters_localized_to_course_localized_fk',
    }).onDelete('cascade'),
  }),
);

export const contentCourseTags = content.table(
  'course_tags',
  (t) => ({
    courseId: t
      .varchar({ length: 20 })
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

// COURSE PAYMENTS
export const coursePaymentFormatEnum = pgEnum('course_payment_format', [
  'online',
  'inperson',
]);

export const coursePaymentMethodEnum = pgEnum('course_payment_method', [
  'sbp',
  'stripe',
  'free',
]);

export const usersCoursePayment = users.table(
  'course_payment',
  (t) => ({
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    courseId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentCourses.id, {
        onUpdate: 'cascade',
      }),
    format: coursePaymentFormatEnum('format').default('inperson').notNull(),
    paymentStatus: t.varchar({ length: 30 }).notNull(),
    amount: t.integer().notNull(),
    paymentId: t.varchar({ length: 255 }).notNull(),
    invoiceUrl: t.varchar({ length: 255 }),
    stripeInvoiceId: t.varchar({ length: 255 }),
    stripePaymentIntent: t.varchar({ length: 255 }),
    method: coursePaymentMethodEnum('method').notNull(),
    couponCode: t.varchar({ length: 20 }).references(() => couponCode.code),
    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
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
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    courseId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    chapterId: t
      .uuid()
      .notNull()
      .references(() => contentCourseChapters.chapterId, {
        onDelete: 'cascade',
      }),
    completedAt: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    booked: t.boolean().default(false),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.courseId, table.chapterId],
    }),
    uidIdx: index().on(table.uid),
    courseIdIdx: index().on(table.courseId),
  }),
);

export const usersCourseProgress = users.table(
  'course_progress',
  (t) => ({
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    courseId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    startDate: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    completedChaptersCount: t.integer().default(0).notNull(),
    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    progressPercentage: t.integer().default(0).notNull(),
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
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    courseId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    general: t.integer().default(0).notNull(),
    length: t.integer().default(0).notNull(),
    difficulty: t.integer().default(0).notNull(),
    quality: t.integer().default(0).notNull(),
    faithful: t.integer().default(0).notNull(),
    recommand: t.integer().default(0).notNull(),
    publicComment: t.text(),
    teacherComment: t.text(),
    adminComment: t.text(),
    createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.courseId],
    }),
  }),
);

// EVENTS

export const eventTypeEnum = pgEnum('event_type', [
  'conference',
  'workshop',
  'course',
  'lecture',
  'exam',
  'meetup',
]);

export const contentEvents = content.table('events', (t) => ({
  id: t.uuid().primaryKey(),
  projectId: t
    .uuid()
    .references(() => contentProjects.id, { onDelete: 'set null' }),
  path: t.varchar({ length: 255 }).unique().notNull(),
  type: eventTypeEnum(),
  name: t.text(),
  description: t.text(),
  startDate: t.timestamp().notNull(),
  endDate: t.timestamp().notNull(),
  timezone: t.text(),
  priceDollars: t.integer(),
  availableSeats: t.integer(),
  remainingSeats: t.integer(),
  bookOnline: t.boolean().default(false),
  bookInPerson: t.boolean().default(false),
  addressLine1: t.text('address_line_1'),
  addressLine2: t.text('address_line_2'),
  addressLine3: t.text('address_line_3'),
  professor: t.text(),
  courseRelated: t.text(),
  websiteUrl: t.text(),
  replayUrl: t.text(),
  liveUrl: t.text(),
  chatUrl: t.text(),
  assetUrl: t.text(),
  rawDescription: t.text(),
  lastUpdated: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
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
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    eventId: t
      .uuid()
      .notNull()
      .references(() => contentEvents.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    booked: t.boolean().default(false),
    withPhysical: t.boolean().default(false),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.eventId],
    }),
    uidIdx: index().on(table.uid),
    eventIdIdx: index().on(table.eventId),
  }),
);

export const usersEventPayment = users.table(
  'event_payment',
  (t) => ({
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    eventId: t
      .uuid()
      .notNull()
      .references(() => contentEvents.id, {
        onUpdate: 'cascade',
      }),
    withPhysical: t.boolean().default(false),
    stripeInvoiceId: t.varchar({ length: 255 }),
    stripePaymentIntent: t.varchar({ length: 255 }),
    method: coursePaymentMethodEnum('method').notNull(),
    couponCode: t.varchar({ length: 20 }).references(() => couponCode.code),
    paymentStatus: t.varchar({ length: 30 }).notNull(),
    amount: t.integer().notNull(),
    paymentId: t.varchar({ length: 255 }).notNull(),
    invoiceUrl: t.varchar({ length: 255 }),
    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.eventId, table.paymentId],
    }),
  }),
);

// TUTORIALS

export const contentTutorials = content.table(
  'tutorials',
  (t) => ({
    id: t.uuid().primaryKey().notNull(),
    projectId: t
      .uuid()
      .references(() => contentProjects.id, { onDelete: 'set null' }),
    path: t.varchar({ length: 255 }).unique().notNull(),
    logoUrl: t.text().notNull().default(''),

    name: t.varchar({ length: 255 }).notNull(),
    category: t.varchar({ length: 255 }).notNull(),
    subcategory: t.varchar({ length: 255 }),
    originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),

    level: t.varchar({ length: 255 }).notNull(),

    lastUpdated: t
      .timestamp({
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
    lastCommit: t.varchar({ length: 40 }).notNull(),
    lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (table) => ({
    unqNameCategory: unique().on(table.name, table.category),
  }),
);

export const contentTutorialsLocalized = content.table(
  'tutorials_localized',
  (t) => ({
    tutorialId: t
      .uuid()
      .notNull()
      .references(() => contentTutorials.id, {
        onDelete: 'cascade',
      }),
    language: t.varchar({ length: 10 }).notNull(),
    title: t.text().notNull(),
    description: t.text(),
    rawContent: t.text().notNull(),
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
    tutorialId: t
      .uuid()
      .notNull()
      .references(() => contentTutorials.id, {
        onDelete: 'cascade',
      }),
    tagId: t
      .integer()
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
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
    tutorialId: t
      .uuid()
      .notNull()
      .references(() => contentTutorials.id, {
        onDelete: 'cascade',
      }),
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    liked: t.boolean().notNull(), // true = liked, false = disliked
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.tutorialId, table.uid],
    }),
  }),
);

// QUIZZES AND EXAMS

export const contentQuizQuestions = content.table('quiz_questions', (t) => ({
  id: t.uuid().primaryKey().notNull(),

  courseId: t
    .varchar({ length: 20 })
    .notNull()
    .references(() => contentCourses.id, { onDelete: 'cascade' }),

  chapterId: t
    .uuid()
    .notNull()
    .references(() => contentCourseChapters.chapterId, {
      onDelete: 'cascade',
    }),

  difficulty: t.varchar({ length: 255 }).notNull(),
  author: t.varchar({ length: 255 }),
  duration: t.integer(),

  disabled: t.boolean().default(false),

  lastUpdated: t
    .timestamp({
      withTimezone: true,
    })
    .defaultNow()
    .notNull(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

export const contentQuizQuestionsLocalized = content.table(
  'quiz_questions_localized',
  (t) => ({
    quizQuestionId: t
      .uuid()
      .notNull()
      .references(() => contentQuizQuestions.id, { onDelete: 'cascade' }),
    language: t.varchar({ length: 10 }).notNull(),
    question: t.text().notNull(),
    answer: t.text().notNull(),
    wrongAnswers: t.text().array().notNull(),
    explanation: t.text(),
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
    quizQuestionId: t
      .uuid()
      .notNull()
      .references(() => contentQuizQuestions.id, { onDelete: 'cascade' }),

    order: t.integer().notNull(),
    correct: t.boolean().notNull(),
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
    quizQuestionId: t.uuid().notNull(),
    order: t.integer().notNull(),

    language: t.varchar({ length: 10 }).notNull(),
    text: t.text().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.quizQuestionId, table.order, table.language],
    }),
    parent: foreignKey({
      columns: [table.quizQuestionId, table.order],
      foreignColumns: [
        contentQuizAnswers.quizQuestionId,
        contentQuizAnswers.order,
      ],
      name: 'quiz_answers_localized_to_quiz_answers_fk',
    }).onDelete('cascade'),
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
  id: t.uuid().defaultRandom().primaryKey().notNull(),

  examId: t
    .uuid()
    .notNull()
    .references(() => usersExamAttempts.id, { onDelete: 'cascade' }),
  questionId: t
    .uuid()
    .notNull()
    .references(() => contentQuizQuestions.id, { onDelete: 'cascade' }),
}));

export const usersExamAnswers = users.table('exam_answers', (t) => ({
  questionId: t
    .uuid()
    .primaryKey()
    .notNull()
    .references(() => usersExamQuestions.id, { onDelete: 'cascade' }),

  order: t.integer(),
}));

export const usersExamAttempts = users.table('exam_attempts', (t) => ({
  id: t.uuid().defaultRandom().primaryKey().notNull(),

  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  courseId: t
    .varchar({ length: 20 })
    .notNull()
    .references(() => contentCourses.id, { onDelete: 'cascade' }),

  language: t.varchar({ length: 10 }).notNull(),
  finalized: t.boolean().default(false).notNull(),
  score: t.integer().default(0),
  succeeded: t.boolean().default(false).notNull(),

  startedAt: t.timestamp({ withTimezone: true }).notNull(),
  finishedAt: t.timestamp({ withTimezone: true }),
}));

export const userExamTimestamps = users.table('exam_timestamps', (t) => ({
  id: t.uuid().defaultRandom().primaryKey().notNull(),

  // Reference to exam attempt
  examAttemptId: t
    .uuid()
    .notNull()
    .references(() => usersExamAttempts.id, { onDelete: 'cascade' }),

  // Timestamp data
  txt: t.text().notNull(), // Text to timestamp
  sig: t.text().notNull(), // Signed message
  ots: blob('ots').notNull(), // OpenTimestamps proof
  hash: t.varchar({ length: 64 }).notNull(), // Hash of the signature (ots target)

  // Is the timestamp is confirmed
  confirmed: t.boolean().default(false).notNull(),
  blockHash: t.varchar({ length: 64 }),
  blockHeight: t.integer(),
  blockTimestamp: t.bigint({ mode: 'bigint' }),

  // If pdf/image has been generated
  pdfKey: t.varchar({ length: 255 }),
  imgKey: t.varchar({ length: 255 }),

  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp().defaultNow().notNull(),
  confirmedAt: t.timestamp(),
}));

export const usersQuizAttempts = users.table(
  'quiz_attempts',
  (t) => ({
    uid: t
      .uuid()
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    chapterId: t
      .uuid()
      .notNull()
      .references(() => contentCourseChapters.chapterId, {
        onDelete: 'cascade',
      }),

    questionsCount: t.integer().notNull(),
    correctAnswersCount: t.integer().notNull(),

    doneAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.chapterId],
    }),
  }),
);

// PROFESSORS

export const contentContributors = content.table('contributors', (t) => ({
  id: t.varchar({ length: 20 }).primaryKey().notNull(),
}));

export const contentProfessors = content.table('professors', (t) => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  path: t.varchar({ length: 255 }).unique().notNull(),

  name: t.varchar({ length: 255 }).unique().notNull(),
  company: t.varchar({ length: 255 }),
  affiliations: t.varchar({ length: 255 }).array(),

  contributorId: t
    .varchar({ length: 20 })
    .unique()
    .notNull()
    .references(() => contentContributors.id, { onDelete: 'cascade' }),

  // Links
  websiteUrl: t.text(),
  twitterUrl: t.text(),
  githubUrl: t.text(),
  nostr: t.text(),

  // Tips
  lightningAddress: t.text(),
  lnurlPay: t.text(),
  paynym: t.text(),
  silentPayment: t.text(),
  tipsUrl: t.text(),

  lastUpdated: t
    .timestamp({
      withTimezone: true,
    })
    .defaultNow()
    .notNull(),
  lastCommit: t.varchar({ length: 40 }).notNull(),
  lastSync: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

export const contentProfessorsLocalized = content.table(
  'professors_localized',
  (t) => ({
    professorId: t
      .integer()
      .notNull()
      .references(() => contentProfessors.id, { onDelete: 'cascade' }),
    language: t.varchar({ length: 10 }).notNull(),

    // Per translation
    bio: t.text(),
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
      .integer()
      .notNull()
      .references(() => contentProfessors.id, { onDelete: 'cascade' }),
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
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    contributorId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentContributors.id, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.contributorId],
    }),
  }),
);

export const contentCourseChaptersLocalizedProfessors = content.table(
  'course_chapters_localized_professors',
  (t) => ({
    courseId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentCourses.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    chapterId: t
      .uuid()
      .notNull()
      .references(() => contentCourseChapters.chapterId, {
        onDelete: 'cascade',
      }),
    language: t.varchar({ length: 10 }).notNull(),
    contributorId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentContributors.id, { onDelete: 'cascade' }),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [
        table.contributorId,
        table.courseId,
        table.chapterId,
        table.language,
      ],
    }),
  }),
);

export const contentTutorialCredits = content.table(
  'tutorial_credits',
  (t) => ({
    tutorialId: t
      .uuid()
      .primaryKey()
      .notNull()
      .references(() => contentTutorials.id, {
        onDelete: 'cascade',
      }),
    contributorId: t
      .varchar({ length: 20 })
      .references(() => contentContributors.id, { onDelete: 'cascade' }),

    name: t.varchar({ length: 255 }),
    link: t.text(),

    // Tips
    lightningAddress: t.text(),
    lnurlPay: t.text(),
    paynym: t.text(),
    silentPayment: t.text(),
    tipsUrl: t.text(),
  }),
);

export const couponCode = content.table('coupon_code', (t) => ({
  code: t.varchar({ length: 20 }).primaryKey().notNull(),
  itemId: t.varchar({ length: 100 }).notNull(),
  reductionPercentage: t.integer(),
  isUnique: t.boolean().notNull().default(true),
  isUsed: t.boolean().notNull().default(false),
  uid: t.uuid().references(() => usersAccounts.uid, {
    onDelete: 'cascade',
  }),
  timeUsed: t.timestamp({
    withTimezone: true,
  }),
}));

/**
 * Custom drizzle type for bytea columns.
 */

export const tokenTypeEnum = pgEnum('token_type', [
  'validate_email',
  'reset_password',
  'login',
]);

export const token = users.table('tokens', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, {
      onDelete: 'cascade',
    }),
  type: tokenTypeEnum().notNull(),
  // Arbitrary data to store with the token
  data: t.varchar({ length: 255 }),
  expiresAt: t.timestamp().notNull(),
  // When the token was consumed (used)
  consumedAt: t.timestamp(),
}));

/**
 * Table to store coordinates for events (bound by address_line_1).
 */
export const contentEventLocation = content.table('event_locations', (t) => ({
  placeId: t.integer().notNull(), // OSM place_id
  name: t.text().primaryKey(), // address_line_1 in the events table
  lat: t.doublePrecision().notNull(),
  lng: t.doublePrecision().notNull(),
}));

export const contentProofreading = content.table(
  'proofreading',
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),

    courseId: t.varchar({ length: 20 }).references(() => contentCourses.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    tutorialId: t.uuid().references(() => contentTutorials.id, {
      onDelete: 'cascade',
    }),
    resourceId: t.integer().references(() => contentResources.id, {
      onDelete: 'cascade',
    }),

    language: t.varchar({ length: 10 }).notNull(),
    lastContributionDate: t.timestamp({
      withTimezone: true,
    }),
    urgency: t.integer(),
    reward: t.integer(),
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
    proofreadingId: t
      .uuid()
      .notNull()
      .unique()
      .references(() => contentProofreading.id, {
        onDelete: 'cascade',
      }),
    contributorId: t
      .varchar({ length: 20 })
      .notNull()
      .references(() => contentContributors.id, { onDelete: 'cascade' }),
    order: t.integer().notNull(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.proofreadingId, table.contributorId],
    }),
  }),
);
