# @blms/database

This package contains the database schema and migrations for the Bitcoin Learning Management System.

## Structure

- `drizzle/schema.ts`: Complete database schema for the BLMS with content and users schemas
- `drizzle/index.ts`: Exports all schema modules and tables
- `drizzle/migrations/`: Contains all generated migrations
- `src/client.ts`: PostgreSQL client with helper functions
- `src/helpers.ts`: Database utility functions
- `src/index.ts`: Main package exports

## Schema Organization

The database uses PostgreSQL with two main schemas:

### Content Schema (`content`)

Contains all educational content and related data:

- **Courses**: Course definitions, parts, chapters, and localized content
- **Resources**: Educational resources (books, videos, tutorials, etc.)
- **Events**: Educational events and workshops
- **Professors**: Instructor information and profiles
- **Translations**: Course translation management tables
- **Tags**: Content categorization and tagging
- **Quizzes**: Questions, answers, and quiz content

### Users Schema (`users`)

Contains user-related data and functionality:

- **Accounts**: User accounts, settings, and authentication
- **Progress**: Course progress and completion tracking
- **Payments**: Course and event payment records
- **Career**: Career profiles and job matching
- **Notifications**: User notification system
- **Translation Management**: Translation assignments, reviews, and reviewer qualifications
- **Exams**: Exam attempts and results

## Translation System

The database includes a comprehensive translation management system:

### Translation Tables

- `course_translations`: Main translation records for courses
- `course_translation_chapters`: Translation records for course chapters

### Assignment and Review System

- `translation_assignments`: Assignments of translators to translation tasks
- `translation_reviews`: Reviews and feedback on translations
- `reviewer_languages`: Language proficiency records for reviewers

### Translation Status Flow

1. `todo` → `in_progress` → `ready_for_review` → `under_review` → `published`
2. Assignment status: `requested` → `assigned` → `in_progress` → `completed`
3. Review status: `approved` | `rejected` | `needs_changes`

## Development

### Generate Migrations

After making changes to the schema, generate migrations with:

```bash
pnpm -F @blms/database drizzle:generate
```

### Apply Migrations

To apply migrations to your local database:

```bash
pnpm -F @blms/database db:migrate:local
```

### Generate and Apply Together

To build, generate migrations, and apply them in one step:

```bash
pnpm -F @blms/database tsx scripts/generate-migrate.ts
```

## Usage

Import the schema in your code:

```typescript
// Import everything
import * as schema from '@blms/database';

// Import specific tables
import {
  contentCourseTranslations,
  usersTranslationAssignments,
  contentCourses,
  usersAccounts
} from '@blms/database';

// Import client and helpers
import {
  createPostgresClient,
  type PostgresClient,
  firstRow,
  rejectOnEmpty
} from '@blms/database';

// Use with drizzle
const client = createPostgresClient(config);
const db = drizzle(client, { schema });
```

## Key Features

- **Type Safety**: Full TypeScript support with Drizzle ORM
- **Schema Separation**: Logical separation between content and user data
- **Translation Management**: Complete workflow for content translation
- **Audit Trail**: Tracking of changes with timestamps and commit hashes
- **Flexible Content**: Support for multiple content types and formats
- **User Management**: Comprehensive user profiles and progress tracking
