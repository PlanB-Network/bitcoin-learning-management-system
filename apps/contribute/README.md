# BLMS Contribute App

The Contribute App is a specialized platform for content contributors to manage and translate educational content within the Bitcoin Learning Management System.

## Purpose

This application provides a dedicated interface for:

- **Content Translation**: Translate courses, parts, and chapters into multiple languages
- **Assignment Management**: View and manage translation assignments
- **Review System**: Review and approve translations from other contributors
- **Progress Tracking**: Monitor translation completion and quality metrics
- **Collaboration**: Work with other contributors and reviewers

## Architecture

The Contribute App follows the same architectural patterns as the main web application while focusing on content management workflows.

### Shared Foundation

The app reuses core components from the web application:

- **Authentication System**: Complete auth flow with modals and session management
- **Header & Navigation**: Consistent header with language selector and user menu
- **UI Components**: Shared design system from `@blms/ui` package
- **Providers**: Same provider structure for context and state management
- **Hooks**: Common hooks for responsive design, tRPC, and utilities

### Specialized Features

- **Translation Interface**: Dedicated components for managing course translations
- **Assignment Dashboard**: View assigned translation tasks and deadlines
- **Review Workflow**: Interface for reviewing and providing feedback on translations
- **Progress Visualization**: Charts and metrics for translation completion

## Structure

```
src/
├── components/        # React components
│   ├── AuthModals/    # Authentication components (shared)
│   ├── Header/        # Header and navigation (shared)
│   ├── layouts/       # Layout components
│   └── ui/            # UI components specific to contribute app
├── hooks/             # Custom React hooks
├── molecules/         # Molecular components (Flag, etc.)
├── organisms/         # Complex components
├── providers/         # Context providers (shared)
├── routes/            # File-based routing with TanStack Router
│   └── $lang/         # Language-specific routes
│       ├── content/   # Content management routes
│       └── dashboard/ # Contributor dashboard
├── services/          # API integration and business logic
└── utils/             # Utility functions
```

## Key Features

### Translation Management

- **Course Translation**: Interface for translating course content
- **Part & Chapter Translation**: Granular translation of course components
- **Status Tracking**: Visual indicators for translation progress
- **Content Preview**: Preview translated content before submission

### Assignment System

- **Task Assignment**: View assigned translation tasks
- **Deadline Management**: Track assignment deadlines and priorities
- **Workload Distribution**: Balanced assignment of translation work
- **Status Updates**: Real-time updates on assignment progress

### Review Workflow

- **Translation Review**: Review translations from other contributors
- **Feedback System**: Provide detailed feedback and suggestions
- **Approval Process**: Approve or request changes for translations
- **Quality Control**: Ensure translation quality and consistency

### Collaboration Tools

- **Contributor Profiles**: View other contributors and their expertise
- **Language Proficiency**: Track reviewer language qualifications
- **Communication**: Built-in messaging and feedback systems
- **Progress Sharing**: Share progress and collaborate on translations

## Technology Stack

- **React**: Frontend library with TypeScript
- **TanStack Router**: File-based routing system
- **TanStack Query**: Data fetching and caching
- **tRPC**: Type-safe API integration
- **Tailwind CSS**: Utility-first styling
- **i18next**: Internationalization support

## Development

### Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Environment Setup

The app shares environment configuration with the main web application and requires:

- API endpoint configuration
- Database connection (via API)
- Authentication settings
- CDN configuration for assets

### Component Development

Follow the established patterns from the web application:

```typescript
// Use shared hooks
import { useDisclosure, useTrpc } from '../hooks';
// For responsive hooks, import directly from contribute app hooks
import { useGreater, useSmaller } from '../hooks';

// Use shared UI components
import { Button, Input, Modal } from '@blms/ui';

// Use shared providers
import { useContext } from '../providers/context';
```

## API Integration

The app uses the same tRPC client as the web application with additional endpoints for translation management:

```typescript
// Translation operations
const translations = trpc.content.translations.getCourseTranslations.useQuery();
const updateTranslation = trpc.content.translations.updateTranslation.useMutation();

// Assignment operations
const assignments = trpc.user.assignments.getMyAssignments.useQuery();
const completeAssignment = trpc.user.assignments.complete.useMutation();
```

## Routing Structure

The app uses file-based routing organized by language:

```
routes/
└── $lang/
    ├── index.tsx              # Dashboard home
    ├── content/
    │   └── translate/
    │       └── $courseId.tsx  # Course translation interface
    └── dashboard/
        ├── assignments.tsx    # Assignment management
        ├── reviews.tsx        # Review dashboard
        └── progress.tsx       # Progress tracking
```

## Shared Components

### From Web App

- **AuthModals**: Complete authentication system
- **Header**: Navigation and user menu
- **Footer**: Consistent footer across applications
- **UI Components**: Button, Input, Modal, etc.

### Contribute-Specific

- **TranslationEditor**: Interface for editing translations
- **AssignmentCard**: Display assignment information
- **ProgressChart**: Visualize translation progress
- **ReviewInterface**: Review and approve translations

## State Management

- **Authentication**: Shared auth context from web app
- **Translation State**: Local state for translation editing
- **Assignment State**: Track assignment progress and status
- **Review State**: Manage review workflow and feedback

## Deployment

The Contribute App is deployed alongside the web application and shares:

- **Build Pipeline**: Same build and deployment process
- **Environment Configuration**: Shared environment variables
- **CDN Assets**: Same asset delivery network
- **Authentication**: Shared session management

## Contributing

When contributing to the Contribute App:

1. Follow the same code standards as the web application
2. Reuse shared components whenever possible
3. Maintain consistency with the design system
4. Add proper TypeScript types for all new features
5. Include comprehensive tests for translation workflows
