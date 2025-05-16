# BLMS API

Backend API service for the Bitcoin Learning Management System, providing tRPC endpoints for both web and contribute applications.

## Architecture

The API follows a modular architecture with clear separation of concerns:

- **tRPC**: End-to-end type-safe API with automatic TypeScript inference
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Express**: HTTP server with session management and middleware
- **Authentication**: Session-based auth with role and permission checks

## Structure

```
src/
├── routers/           # API route definitions
│   ├── auth/          # Authentication endpoints
│   ├── content/       # Content management endpoints
│   ├── user/          # User-related endpoints
│   └── rest/          # REST endpoints for file uploads, etc.
├── procedures/        # tRPC procedure definitions
├── middlewares/       # Request processing middleware
├── services/          # Business logic and external services
├── trpc/              # tRPC configuration and context
└── utils/             # Utility functions
```

## API Routers

### Authentication Router (`/auth`)

Handles user authentication and session management:

- **Sign In**: Email/password authentication
- **Sign Up**: User registration
- **Sign Out**: Session termination
- **Password Reset**: Password recovery flow
- **Session Management**: Current user session info

### Content Router (`/content`)

Manages educational content and resources:

- **Courses**: Course CRUD operations, enrollment, progress
- **Translations**: Course translation management
- **Resources**: Educational resources (books, videos, tutorials)
- **Events**: Educational events and workshops
- **Professors**: Instructor profiles and information
- **Blogs**: Blog posts and articles
- **Labs**: Study groups and lab sessions
- **Videos**: Video content management
- **Tutorials**: Tutorial content and metadata

### User Router (`/user`)

User-specific operations and data:

- **Profile**: User profile management
- **Progress**: Course progress tracking
- **Billing**: Payment and subscription management
- **Career**: Career profile and job matching
- **Notifications**: User notification system
- **Events**: User event bookings and attendance
- **Courses**: User course enrollment and completion
- **Tutorials**: User tutorial interactions

### REST Endpoints

Non-tRPC endpoints for specific use cases:

- **File Uploads**: Image and document uploads
- **Payment Webhooks**: Stripe payment processing
- **Metadata**: Open Graph and social media metadata
- **Sync**: Content synchronization from external sources

## Translation Management API

The API includes comprehensive translation management endpoints:

### Translation Endpoints

- `content.translations.getCourseTranslations`: Get all translations for a course
- `content.translations.getTranslationStatus`: Get translation status and progress
- `content.translations.updateTranslation`: Update translation content
- `content.translations.submitForReview`: Submit translation for review
- `content.translations.assignTranslator`: Assign translator to course
- `content.translations.reviewTranslation`: Review and approve/reject translations

### Assignment System

- Role-based assignment (translator, reviewer, super_reviewer)
- Language proficiency tracking
- Assignment status management
- Workload distribution

## Authentication & Authorization

### Session Management

- Cookie-based sessions with PostgreSQL storage
- Automatic session renewal
- Cross-application session sharing

### Role-Based Access Control

User roles with hierarchical permissions:

- **Student**: Basic access to courses and content
- **Professor**: Course creation and management
- **Contributor**: Content translation and editing
- **Admin**: System administration
- **SuperAdmin**: Full system access

### Permission System

Granular permissions for specific operations:

- `admin:courses`: Course administration
- `admin:quizzes`: Quiz management
- `contribute:reviewer`: Translation review access
- `contribute:super_reviewer`: Advanced review permissions
- `contribute:assign`: Assignment management

## Development

### Environment Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start development server
pnpm dev
```

### Database Operations

```bash
# Generate migrations
pnpm -F @blms/database drizzle:generate

# Apply migrations
pnpm -F @blms/database db:migrate:local
```

### API Testing

The API provides full TypeScript support for client applications:

```typescript
import { createTRPCClient } from '@trpc/client';
import type { TrpcRouter } from './src/routers/trpc-router';

const client = createTRPCClient<TrpcRouter>({
  // ... configuration
});

// Fully typed API calls
const courses = await client.content.courses.getAll.query();
const user = await client.user.profile.get.query();
```

## Key Features

- **Type Safety**: End-to-end TypeScript with automatic inference
- **Real-time Updates**: WebSocket support for live data
- **File Handling**: Secure file upload and processing
- **Payment Integration**: Stripe integration for course payments
- **Content Sync**: Automated content synchronization
- **Internationalization**: Multi-language content support
- **Audit Logging**: Comprehensive operation tracking
- **Error Handling**: Structured error responses with proper HTTP codes
