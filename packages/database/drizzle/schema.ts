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
  passwordHash: t.varchar({ length: 255 }),
  contributorId: t.varchar({ length: 20 }).unique().notNull(),
  professorId: t
    .integer()
    .unique()
    .references(() => contentProfessors.id),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

// BLOGS

export const contentBlogs = content.table(
  'blogs',
  (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
    path: t.varchar({ length: 255 }).unique().notNull(),

    name: t.varchar({ length: 255 }).notNull(),
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
  }),
  (table) => ({
    unqNameCategory: unique().on(table.name, table.category),
  }),
);

export const contentBlogsLocalized = content.table(
  'blogs_localized',
  (t) => ({
    blogId: t
      .integer()
      .notNull()
      .references(() => contentBlogs.id, { onDelete: 'cascade' }),
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
      .integer()
      .notNull()
      .references(() => contentBlogs.id, { onDelete: 'cascade' }),
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

// BCERTIFICATE

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
  type: betTypeEnum().notNull(),
  builder: t.text(),
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

// BUILDERS

export const contentBuilders = content.table('builders', (t) => ({
  resourceId: t
    .integer()
    .primaryKey()
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

export const contentBuildersLocalized = content.table(
  'builders_localized',
  (t) => ({
    builderId: t
      .integer()
      .notNull()
      .references(() => contentBuilders.resourceId, { onDelete: 'cascade' }),
    language: t.varchar({ length: 10 }).notNull(),

    // Per translation
    description: t.text(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.builderId, table.language],
    }),
  }),
);

// CONFERENCES

export const contentConferences = content.table('conferences', (t) => ({
  resourceId: t
    .integer()
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  name: t.text().notNull(),
  description: t.text(),
  year: t.text().notNull(),
  builder: t.varchar({ length: 255 }),
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

// COURSES

export const courseFormatEnum = pgEnum('course_format', [
  'online',
  'inperson',
  'hybrid',
]);

export const contentCourses = content.table('courses', (t) => ({
  id: t.varchar({ length: 20 }).primaryKey().notNull(),

  level: t.varchar({ length: 255 }).notNull(),
  hours: t.doublePrecision().notNull(),
  topic: t.text().notNull(),
  subtopic: t.text().notNull(),
  originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),

  requiresPayment: t.boolean().default(false).notNull(),
  format: courseFormatEnum().default('online').notNull(),
  onlinePriceDollars: t.integer(),
  inpersonPriceDollars: t.integer(),
  paidDescription: t.text(),
  paidVideoLink: t.text(),
  paidStartDate: t.timestamp({ withTimezone: true }),
  paidEndDate: t.timestamp({ withTimezone: true }),
  contact: t.varchar({ length: 255 }),
  availableSeats: t.integer().default(0),
  remainingSeats: t.integer(),

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
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    format: coursePaymentFormatEnum('format').default('inperson').notNull(),
    paymentStatus: t.varchar({ length: 30 }).notNull(),
    amount: t.integer().notNull(),
    paymentId: t.varchar({ length: 255 }).notNull(),
    invoiceUrl: t.varchar({ length: 255 }),
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
  id: t.varchar({ length: 100 }).primaryKey().notNull(),
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
  builder: t.varchar({ length: 255 }),
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
      .varchar({ length: 100 })
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
      .varchar({ length: 100 })
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
      .varchar({ length: 100 })
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
      .varchar({ length: 100 })
      .notNull()
      .references(() => contentEvents.id, {
        onUpdate: 'cascade',
      }),
    withPhysical: t.boolean().default(false),
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
    path: t.varchar({ length: 255 }).unique().notNull(),

    name: t.varchar({ length: 255 }).notNull(),
    category: t.varchar({ length: 255 }).notNull(),
    subcategory: t.varchar({ length: 255 }),
    originalLanguage: t.varchar({ length: 10 }).notNull().default('en'),

    level: t.varchar({ length: 255 }).notNull(),
    builder: t.varchar({ length: 255 }),

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
const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return 'bytea';
  },
});

export const usersFiles = users.table('files', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  // File owner
  uid: t
    .uuid()
    .notNull()
    .references(() => usersAccounts.uid, {
      onDelete: 'cascade',
    }),
  // File raw data
  data: bytea('data'),
  // S3
  s3: t.boolean().default(false).notNull(),
  s3Key: t.varchar({ length: 255 }),
  // File metadata
  checksum: t.varchar({ length: 64 }).notNull(),
  filename: t.varchar({ length: 255 }).notNull(),
  mimetype: t.varchar({ length: 255 }).notNull(),
  filesize: t.integer().notNull(),
  // Timestamps
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
}));

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

/**
 * Table to store coordinates for builders (bound by address_line_1).
 */
export const contentBuilderLocation = content.table(
  'builders_locations',
  (t) => ({
    placeId: t.integer().notNull(), // OSM place_id
    name: t.text().primaryKey(), // address_line_1 in the builders table
    lat: t.doublePrecision().notNull(),
    lng: t.doublePrecision().notNull(),
  }),
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
