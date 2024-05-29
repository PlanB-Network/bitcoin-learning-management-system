import {
  boolean,
  customType,
  doublePrecision,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgSchema,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgSchema('users');
export const content = pgSchema('content');

// ACCOUNTS

export const usersAccounts = users.table('accounts', {
  uid: uuid('uid').defaultRandom().primaryKey().notNull(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  displayName: varchar('display_name', { length: 255 }).unique(),
  picture: uuid('picture'),
  email: varchar('email', { length: 255 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  contributorId: varchar('contributor_id', { length: 20 }).unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// LUD4 PUBLIC KEYS (LNURL)

export const usersLud4PublicKeys = users.table('lud4_public_keys', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  uid: uuid('uid')
    .notNull()
    .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
  publicKey: text('public_key').unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// RESOURCES

export const contentResources = content.table(
  'resources',
  {
    id: serial('id').primaryKey().notNull(),
    category: varchar('category', { length: 255 }).notNull(),
    path: varchar('path', { length: 255 }).notNull(),
    lastUpdated: timestamp('last_updated', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    lastCommit: varchar('last_commit', { length: 40 }).notNull(),
    lastSync: timestamp('last_sync', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    unq: unique().on(table.category, table.path),
  }),
);

export const contentTags = content.table('tags', {
  id: serial('id').primaryKey().notNull(),
  name: varchar('name', { length: 255 }).unique().notNull(),
});

export const contentResourceTags = content.table(
  'resource_tags',
  {
    resourceId: integer('resource_id')
      .notNull()
      .references(() => contentResources.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  },
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

export const contentBet = content.table('bet', {
  resourceId: integer('resource_id')
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  type: betTypeEnum('type').notNull(),
  builder: text('builder'),
  downloadUrl: text('download_url').notNull(),
});

export const contentBetViewUrl = content.table(
  'bet_view_url',
  {
    betId: integer('bet_id')
      .notNull()
      .references(() => contentBet.resourceId, { onDelete: 'cascade' }),
    language: text('language').notNull(),
    viewUrl: text('view_url').notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.betId, table.language],
    }),
  }),
);

export const contentBetLocalized = content.table(
  'bet_localized',
  {
    betId: integer('bet_id')
      .notNull()
      .references(() => contentBet.resourceId, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),

    // Per translation
    name: text('name').notNull(),
    description: text('description').notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.betId, table.language],
    }),
  }),
);

// BOOKS

export const contentBooks = content.table('books', {
  resourceId: integer('resource_id')
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  level: varchar('level', { length: 255 }),
  author: text('author').notNull(),
  websiteUrl: text('website_url'),
});

export const contentBooksLocalized = content.table(
  'books_localized',
  {
    bookId: integer('book_id')
      .notNull()
      .references(() => contentBooks.resourceId, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),
    original: boolean('original').notNull(),

    // Per translation
    title: text('title').notNull(),
    translator: text('translator'),
    description: text('description'),
    publisher: varchar('publisher', { length: 255 }),
    publicationYear: integer('publication_year'),
    cover: text('cover'),
    summaryText: text('summary_text'),
    summaryContributorId: varchar('summary_contributor_id', { length: 20 }),

    // Links
    shopUrl: text('shop_url'),
    downloadUrl: text('download_url'),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.bookId, table.language],
    }),
  }),
);

// BUILDERS

export const contentBuilders = content.table('builders', {
  resourceId: integer('resource_id')
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: varchar('category', { length: 255 }).notNull(),

  // Links
  websiteUrl: text('website_url'),
  twitterUrl: text('twitter_url'),
  githubUrl: text('github_url'),
  nostr: text('nostr'),
});

export const contentBuildersLocalized = content.table(
  'builders_localized',
  {
    builderId: integer('builder_id')
      .notNull()
      .references(() => contentBuilders.resourceId, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),

    // Per translation
    description: text('description'),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.builderId, table.language],
    }),
  }),
);

// CONFERENCES

export const contentConferences = content.table('conferences', {
  resourceId: integer('resource_id')
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  year: text('year').notNull(),
  builder: varchar('builder', { length: 255 }),
  languages: varchar('languages', { length: 255 }).array(),
  location: text('location').notNull(),

  // Links
  websiteUrl: text('website_url'),
  twitterUrl: text('twitter_url'),
});

export const contentConferencesStages = content.table('conferences_stages', {
  stageId: varchar('stage_id').primaryKey().notNull(),
  conferenceId: integer('conference_id')
    .notNull()
    .references(() => contentConferences.resourceId, { onDelete: 'cascade' }),
  name: text('name').notNull(),
});

export const contentConferenceStageVideos = content.table(
  'conferences_stages_videos',
  {
    videoId: varchar('video_id').primaryKey().notNull(),
    stageId: varchar('stage_id')
      .notNull()
      .references(() => contentConferencesStages.stageId, {
        onDelete: 'cascade',
      }),
    name: text('name').notNull(),
    rawContent: text('raw_content').notNull(),
  },
);

// PODCASTS

export const contentPodcasts = content.table('podcasts', {
  resourceId: integer('resource_id')
    .primaryKey()
    .notNull()
    .references(() => contentResources.id, { onDelete: 'cascade' }),
  language: varchar('language', { length: 10 }).notNull(),

  name: text('name').notNull(),
  host: text('host').notNull(),
  description: text('description'),

  // Links
  websiteUrl: text('website_url'),
  twitterUrl: text('twitter_url'),
  podcastUrl: text('podcast_url'),
  nostr: text('nostr'),
});

// COURSES

export const contentCourses = content.table('courses', {
  id: varchar('id', { length: 20 }).primaryKey().notNull(),

  level: varchar('level', { length: 255 }).notNull(),
  hours: doublePrecision('hours').notNull(),

  requiresPayment: boolean('requires_payment').default(false).notNull(),
  paidPriceDollars: integer('paid_price_dollars'),
  paidDescription: text('paid_description'),
  paidVideoLink: text('paid_video_link'),
  paidStartDate: timestamp('paid_start_date', { withTimezone: true }),
  paidEndDate: timestamp('paid_end_date', { withTimezone: true }),
  contact: varchar('contact', { length: 255 }),

  lastUpdated: timestamp('last_updated', { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastCommit: varchar('last_commit', { length: 40 }).notNull(),
  lastSync: timestamp('last_sync', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const contentCoursesLocalized = content.table(
  'courses_localized',
  {
    courseId: varchar('course_id', { length: 20 })
      .notNull()
      .references(() => contentCourses.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),

    // Per translation
    name: text('name').notNull(),
    goal: text('goal').notNull(),
    objectives: text('objectives').array().notNull(),
    rawDescription: text('raw_description').notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.language],
    }),
  }),
);

export const contentCourseParts = content.table(
  'course_parts',
  {
    courseId: varchar('course_id', { length: 20 })
      .notNull()
      .references(() => contentCourses.id, { onDelete: 'cascade' }),
    part: integer('part').notNull(), // To rename part_index
    partId: uuid('part_id').unique().notNull(),
    lastSync: timestamp('last_sync', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.part], //partId
    }),
  }),
);

export const contentCoursePartsLocalized = content.table(
  'course_parts_localized',
  {
    courseId: varchar('course_id', { length: 20 }).notNull(),
    part: integer('part').notNull(), // To remove
    partId: uuid('part_id')
      .notNull()
      .references(() => contentCourseParts.partId, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),

    // Per translation
    title: text('title').notNull(),

    lastSync: timestamp('last_sync', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.part, table.language],
    }),
    fkCoursePartsLocalizedToCourseParts: foreignKey({
      columns: [table.courseId, table.part],
      foreignColumns: [contentCourseParts.courseId, contentCourseParts.part],
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
  {
    courseId: varchar('course_id', { length: 20 }).notNull(),
    part: integer('part').notNull(), // To remove
    chapter: integer('chapter').notNull(), // To rename chapter_index
    partId: uuid('part_id')
      .notNull()
      .references(() => contentCourseParts.partId, { onDelete: 'cascade' }),
    chapterId: uuid('chapter_id').unique().notNull(),
    lastSync: timestamp('last_sync', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.part, table.chapter],
    }),
    fkCourseChaptersToCourseParts: foreignKey({
      columns: [table.courseId, table.part],
      foreignColumns: [contentCourseParts.courseId, contentCourseParts.part],
      name: 'course_chapters_to_course_parts_fk',
    }).onDelete('cascade'),
  }),
);

export const contentCourseChaptersLocalized = content.table(
  'course_chapters_localized',
  {
    courseId: varchar('course_id', { length: 20 }).notNull(),
    part: integer('part').notNull(), // To remove
    chapter: integer('chapter').notNull(), // To remove
    chapterId: uuid('chapter_id')
      .notNull()
      .references(() => contentCourseChapters.chapterId, {
        onDelete: 'cascade',
      }),
    language: varchar('language', { length: 10 }).notNull(),
    releasePlace: varchar('release_place', { length: 50 }),

    isOnline: boolean('is_online').default(false).notNull(),
    isInPerson: boolean('is_in_person').default(false).notNull(),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    timezone: text('timezone'),
    addressLine1: text('address_line_1'),
    addressLine2: text('address_line_2'),
    addressLine3: text('address_line_3'),
    liveUrl: text('live_url'),
    chatUrl: text('chat_url'),
    availableSeats: integer('available_seats'),
    remainingSeats: integer('remaining_seats'),
    liveLanguage: text('live_language'),

    // Per translation
    title: text('title').notNull(),
    sections: text('sections').array().notNull(),
    rawContent: text('raw_content').notNull(),
    lastSync: timestamp('last_sync', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.part, table.chapter, table.language],
    }),
    fkCourseChaptersLocalizedToCourseChapters: foreignKey({
      columns: [table.courseId, table.part, table.chapter],
      foreignColumns: [
        contentCourseChapters.courseId,
        contentCourseChapters.part, // coursePart.partId ?
        contentCourseChapters.chapter,
      ],
      name: 'course_chapters_localized_to_course_chapters_fk',
    }).onDelete('cascade'),
    fkCourseChaptersLocalizedToCourseLocalized: foreignKey({
      columns: [table.courseId, table.language],
      foreignColumns: [
        contentCoursesLocalized.courseId,
        contentCoursesLocalized.language,
      ],
      name: 'course_chapters_localized_to_course_localized_fk',
    }).onDelete('cascade'),
    fkCourseChaptersLocalizedToCoursePartsLocalized: foreignKey({
      columns: [table.courseId, table.part, table.language],
      foreignColumns: [
        contentCoursePartsLocalized.courseId,
        contentCoursePartsLocalized.part,
        contentCoursePartsLocalized.language,
      ],
      name: 'course_chapters_localized_to_course_parts_localized_fk',
    }).onDelete('cascade'),
  }),
);

export const contentCourseTags = content.table(
  'course_tags',
  {
    courseId: varchar('course_id', { length: 20 })
      .notNull()
      .references(() => contentCourses.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.tagId],
    }),
  }),
);

// COURSE PAYMENTS

export const usersCoursePayment = users.table(
  'course_payment',
  {
    uid: uuid('uid')
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    courseId: varchar('course_id', { length: 20 })
      .notNull()
      .references(() => contentCourses.id, { onDelete: 'cascade' }),
    paymentStatus: varchar('payment_status', { length: 30 }).notNull(),
    amount: integer('amount').notNull(),
    paymentId: varchar('payment_id', { length: 255 }).notNull(),
    invoiceUrl: varchar('invoice_url', { length: 255 }),
    couponCode: varchar('coupon_code', { length: 20 }).references(
      () => couponCode.code,
    ),
    lastUpdated: timestamp('last_updated', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.courseId, table.paymentId],
    }),
  }),
);

// COURSES PROGRESS

export const usersCourseUserChapter = users.table(
  'course_user_chapter',
  {
    uid: uuid('uid')
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    courseId: varchar('course_id', { length: 20 })
      .notNull()
      .references(() => contentCourses.id, { onDelete: 'cascade' }),
    chapterId: uuid('chapter_id')
      .notNull()
      .references(() => contentCourseChapters.chapterId, {
        onDelete: 'cascade',
      }),
    completedAt: timestamp('completed_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    booked: boolean('booked').default(false),
  },
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
  {
    uid: uuid('uid')
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    courseId: varchar('course_id', { length: 20 })
      .notNull()
      .references(() => contentCourses.id, { onDelete: 'cascade' }),

    completedChaptersCount: integer('completed_chapters_count')
      .default(0)
      .notNull(),
    lastUpdated: timestamp('last_updated', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    progressPercentage: integer('progress_percentage').default(0).notNull(),
  },
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
  'meetup',
]);

export const contentEvents = content.table('events', {
  id: varchar('id', { length: 100 }).primaryKey().notNull(),
  path: varchar('path', { length: 255 }).unique().notNull(),
  type: eventTypeEnum('type'),
  name: text('name'),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  timezone: text('timezone'),
  priceDollars: integer('price_dollars'),
  availableSeats: integer('available_seats'),
  remainingSeats: integer('remaining_seats'),
  bookOnline: boolean('book_online').default(false),
  bookInPerson: boolean('book_in_person').default(false),
  addressLine1: text('address_line_1'),
  addressLine2: text('address_line_2'),
  addressLine3: text('address_line_3'),
  builder: varchar('builder', { length: 255 }),
  websiteUrl: text('website_url'),
  replayUrl: text('replay_url'),
  liveUrl: text('live_url'),
  chatUrl: text('chat_url'),
  assetUrl: text('asset_url'),
  rawDescription: text('raw_description'),
  lastUpdated: timestamp('last_updated', { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastCommit: varchar('last_commit', { length: 40 }).notNull(),
  lastSync: timestamp('last_sync', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const contentEventTags = content.table(
  'event_tags',
  {
    eventId: varchar('event_id', { length: 100 })
      .notNull()
      .references(() => contentEvents.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.eventId, table.tagId],
    }),
  }),
);

export const contentEventLanguages = content.table(
  'event_languages',
  {
    eventId: varchar('event_id', { length: 100 })
      .notNull()
      .references(() => contentEvents.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.eventId, table.language],
    }),
  }),
);

export const usersUserEvent = users.table(
  'user_event',
  {
    uid: uuid('uid')
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    eventId: varchar('event_id', { length: 100 })
      .notNull()
      .references(() => contentEvents.id, { onDelete: 'cascade' }),
    booked: boolean('booked').default(false),
    withPhysical: boolean('with_physical').default(false),
  },
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
  {
    uid: uuid('uid')
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    eventId: varchar('event_id', { length: 100 })
      .notNull()
      .references(() => contentEvents.id),
    withPhysical: boolean('with_physical').default(false),
    paymentStatus: varchar('payment_status', { length: 30 }).notNull(),
    amount: integer('amount').notNull(),
    paymentId: varchar('payment_id', { length: 255 }).notNull(),
    invoiceUrl: varchar('invoice_url', { length: 255 }),
    lastUpdated: timestamp('last_updated', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.eventId, table.paymentId],
    }),
  }),
);

// TUTORIALS

export const contentTutorials = content.table(
  'tutorials',
  {
    id: serial('id').primaryKey().notNull(),
    path: varchar('path', { length: 255 }).unique().notNull(),

    name: varchar('name', { length: 255 }).notNull(),
    category: varchar('category', { length: 255 }).notNull(),
    subcategory: varchar('subcategory', { length: 255 }),

    level: varchar('level', { length: 255 }).notNull(),
    builder: varchar('builder', { length: 255 }),

    lastUpdated: timestamp('last_updated', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    lastCommit: varchar('last_commit', { length: 40 }).notNull(),
    lastSync: timestamp('last_sync', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    unqNameCategory: unique().on(table.name, table.category),
  }),
);

export const contentTutorialsLocalized = content.table(
  'tutorials_localized',
  {
    tutorialId: integer('tutorial_id')
      .notNull()
      .references(() => contentTutorials.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),

    // Per translation
    title: text('title').notNull(),
    description: text('description'),
    rawContent: text('raw_content').notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.tutorialId, table.language],
    }),
  }),
);

export const contentTutorialTags = content.table(
  'tutorial_tags',
  {
    tutorialId: integer('tutorial_id')
      .notNull()
      .references(() => contentTutorials.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.tutorialId, table.tagId],
    }),
  }),
);

// QUIZZES

export const contentQuizQuestions = content.table(
  'quiz_questions',
  {
    id: integer('id').primaryKey().notNull(),

    courseId: varchar('course_id', { length: 20 }).notNull(),
    part: integer('part').notNull(), // To remove
    // partId: uuid('part_id')
    //   /*.notNull()*/
    //   .references(() => contentCourseParts.partId, { onDelete: 'cascade' }),
    chapter: integer('chapter').notNull(), // To remove
    // chapterId: uuid('chapter_id')
    //   .unique()
    //   /*.notNull()*/
    //   .references(() => contentCourseChapters.chapterId, {
    //     onDelete: 'cascade',
    //   }),

    difficulty: varchar('difficulty', { length: 255 }).notNull(),
    author: varchar('author', { length: 255 }),
    duration: integer('duration'),

    lastUpdated: timestamp('last_updated', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    lastCommit: varchar('last_commit', { length: 40 }).notNull(),
    lastSync: timestamp('last_sync', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    fkQuizzesToCourseChapters: foreignKey({
      columns: [table.courseId, table.part, table.chapter],
      foreignColumns: [
        contentCourseChapters.courseId,
        contentCourseParts.part, // coursePart.partId ?
        contentCourseChapters.chapter,
      ],
      name: 'quizzes_to_course_chapters_fk',
    }).onDelete('cascade'),
  }),
);

export const contentQuizQuestionsLocalized = content.table(
  'quiz_questions_localized',
  {
    quizQuestionId: integer('quiz_question_id')
      .notNull()
      .references(() => contentQuizQuestions.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),

    // Per translation
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    wrongAnswers: text('wrong_answers').array().notNull(),
    explanation: text('explanation'),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.quizQuestionId, table.language],
    }),
  }),
);

export const contentQuizQuestionTags = content.table(
  'quiz_question_tags',
  {
    quizQuestionId: integer('quiz_question_id')
      .notNull()
      .references(() => contentQuizQuestions.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.quizQuestionId, table.tagId],
    }),
  }),
);

export const usersQuizAttempts = users.table(
  'quiz_attempts',
  {
    uid: uuid('uid')
      .notNull()
      .references(() => usersAccounts.uid, { onDelete: 'cascade' }),
    courseId: varchar('course_id', { length: 20 }).notNull(),
    part: integer('part').notNull(), // To remove
    // partId: uuid('part_id')
    //   /*.notNull()*/
    //   .references(() => contentCourseParts.partId, { onDelete: 'cascade' }),
    chapter: integer('chapter').notNull(), // To remove
    // chapterId: uuid('chapter_id')
    //   /*.notNull()*/
    //   .references(() => contentCourseChapters.chapterId, {
    //     onDelete: 'cascade',
    //   }),

    questionsCount: integer('questions_count').notNull(),
    correctAnswersCount: integer('correct_answers_count').notNull(),

    doneAt: timestamp('done_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.uid, table.courseId, table.part, table.chapter],
    }),
  }),
);

// PROFESSORS

export const contentContributors = content.table('contributors', {
  id: varchar('id', { length: 20 }).primaryKey().notNull(),
});

export const contentProfessors = content.table('professors', {
  id: serial('id').primaryKey().notNull(),
  path: varchar('path', { length: 255 }).unique().notNull(),

  name: varchar('name', { length: 255 }).unique().notNull(),
  company: varchar('company', { length: 255 }),
  affiliations: varchar('affiliations', { length: 255 }).array(),

  contributorId: varchar('contributor_id', { length: 20 })
    .unique()
    .notNull()
    .references(() => contentContributors.id, { onDelete: 'cascade' }),

  // Links
  websiteUrl: text('website_url'),
  twitterUrl: text('twitter_url'),
  githubUrl: text('github_url'),
  nostr: text('nostr'),

  // Tips
  lightningAddress: text('lightning_address'),
  lnurlPay: text('lnurl_pay'),
  paynym: text('paynym'),
  silentPayment: text('silent_payment'),
  tipsUrl: text('tips_url'),

  lastUpdated: timestamp('last_updated', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  lastCommit: varchar('last_commit', { length: 40 }).notNull(),
  lastSync: timestamp('last_sync', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const contentProfessorsLocalized = content.table(
  'professors_localized',
  {
    professorId: integer('professor_id')
      .notNull()
      .references(() => contentProfessors.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 10 }).notNull(),

    // Per translation
    bio: text('bio'),
    shortBio: text('short_bio'),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.professorId, table.language],
    }),
  }),
);

export const contentProfessorTags = content.table(
  'professor_tags',
  {
    professorId: integer('professor_id')
      .notNull()
      .references(() => contentProfessors.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => contentTags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.professorId, table.tagId],
    }),
  }),
);

export const contentCourseProfessors = content.table(
  'course_professors',
  {
    courseId: varchar('course_id', { length: 20 })
      .notNull()
      .references(() => contentCourses.id, { onDelete: 'cascade' }),
    contributorId: varchar('contributor_id', { length: 20 })
      .notNull()
      .references(() => contentContributors.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.courseId, table.contributorId],
    }),
  }),
);

export const contentCourseChaptersLocalizedProfessors = content.table(
  'course_chapters_localized_professors',
  {
    courseId: varchar('course_id', { length: 20 })
      .notNull()
      .references(() => contentCourses.id, { onDelete: 'cascade' }),
    part: integer('part').notNull(), // To remove
    chapter: integer('chapter').notNull(), // To remove
    chapterId: uuid('chapter_id')
      .notNull()
      .references(() => contentCourseChapters.chapterId, {
        onDelete: 'cascade',
      }),
    language: varchar('language', { length: 10 }).notNull(),
    contributorId: varchar('contributor_id', { length: 20 })
      .notNull()
      .references(() => contentContributors.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [
        table.contributorId,
        table.courseId,
        table.part,
        table.chapter,
        table.language,
      ],
    }),
  }),
);

export const contentTutorialCredits = content.table('tutorial_credits', {
  tutorialId: integer('tutorial_id')
    .primaryKey()
    .notNull()
    .references(() => contentTutorials.id, { onDelete: 'cascade' }),
  contributorId: varchar('contributor_id', { length: 20 }).references(
    () => contentContributors.id,
    { onDelete: 'cascade' },
  ),

  name: varchar('name', { length: 255 }),
  link: text('link'),

  // Tips
  lightningAddress: text('lightning_address'),
  lnurlPay: text('lnurl_pay'),
  paynym: text('paynym'),
  silentPayment: text('silent_payment'),
  tipsUrl: text('tips_url'),
});

export const couponCode = content.table('coupon_code', {
  code: varchar('code', { length: 20 }).primaryKey().notNull(),
  itemId: varchar('item_id', { length: 100 }).notNull(),
  reductionPercentage: integer('reduction_percentage'),
  isUnique: boolean('is_unique').notNull().default(true),
  isUsed: boolean('is_used').notNull().default(false),
  uid: uuid('uid').references(() => usersAccounts.uid, {
    onDelete: 'cascade',
  }),
  timeUsed: timestamp('time_used', {
    withTimezone: true,
  }),
});

/**
 * Custom drizzle type for bytea columns.
 */
const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return 'bytea';
  },
});

export const usersFiles = users.table('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  // File owner
  uid: uuid('uid')
    .notNull()
    .references(() => usersAccounts.uid, {
      onDelete: 'cascade',
    }),
  // File raw data
  data: bytea('data'),
  // S3
  s3: boolean('s3').default(false).notNull(),
  s3Key: varchar('s3_key', { length: 255 }),
  // File metadata
  checksum: varchar('checksum', { length: 64 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimetype: varchar('mimetype', { length: 255 }).notNull(),
  filesize: integer('filesize').notNull(),
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
