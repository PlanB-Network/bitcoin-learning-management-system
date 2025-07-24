# Bitcoin Learning Management System Documentation

This directory contains comprehensive documentation for the Bitcoin Learning Management System (BLMS) project.

## Documentation Overview

- [Architecture](./architecture.md) - Overview of the system architecture, applications, and shared packages
- [Code Structure](./code-structure.md) - Detailed explanation of code organization patterns and conventions
- [Reusable Components](./reusable-components.md) - Guide to reusable components and features across the platform
- [Reusable Web Components](./reusable-web-components.md) - Specific components from the web app that can be reused in the contribute app
- [Data Architecture](./data-architecture.md) - Database schema, relationships, and data access patterns
- [Cursor Rules](./cursor-rules.md) - Development rules and patterns for building consistent apps within the BLMS ecosystem

## System Architecture

The BLMS is built as a monorepo using pnpm workspaces, consisting of multiple applications:

- **Web Application** (`apps/web`) - The main user-facing application for accessing educational content
- **API Application** (`apps/api`) - Backend services and endpoints for both web and contribute applications
- **Contribute Application** (`apps/contribute`) - Platform for contributors to manage and translate content

The system leverages shared packages for common functionality:

- UI components and design system
- Service modules for content and user management
- Database models with comprehensive translation support
- Type definitions and validation schemas
- Constants and utilities

## Technology Stack

- **Frontend**: React, TypeScript, TanStack Router, TanStack Query
- **Backend**: Node.js, tRPC, Drizzle ORM
- **Database**: PostgreSQL with schema separation (content/users)
- **Build Tools**: Vite, TurboRepo
- **Styling**: TailwindCSS with shared design system
- **Internationalization**: i18next with comprehensive translation management

## Key Features

### Translation Management System

The BLMS includes a comprehensive translation management system:

- **Course Translation**: Translate courses, parts, and chapters
- **Assignment System**: Assign translation tasks to contributors
- **Review Workflow**: Multi-stage review and approval process
- **Progress Tracking**: Monitor translation status and completion
- **Quality Control**: Reviewer qualifications and feedback system

### Content Management

- **Multi-format Content**: Courses, tutorials, resources, events
- **Version Control**: Git-based content synchronization
- **Media Handling**: Images, videos, and document processing
- **Categorization**: Flexible tagging and categorization system

### User Management

- **Role-based Access**: Student, Professor, Contributor, Admin roles
- **Permission System**: Granular permissions for specific operations
- **Progress Tracking**: Course completion and learning analytics
- **Career Profiles**: Job matching and career development

## Application Structure

### Web Application (`apps/web`)

Main user-facing application with:

- **Component Architecture**: Atomic design with atoms, molecules, organisms
- **Shared Components**: Authentication, header, navigation, layout
- **Internationalization**: Multi-language support with i18next
- **State Management**: TanStack Query + React Context

### Contribute Application (`apps/contribute`)

Specialized platform for content contributors:

- **Shared Foundation**: Reuses authentication, header, and common components from web app
- **Translation Interface**: Dedicated UI for managing course translations
- **Assignment Dashboard**: View and manage translation assignments
- **Review System**: Interface for reviewing and approving translations
- **Progress Tracking**: Monitor translation completion and quality

### API Application (`apps/api`)

Backend service providing:

- **tRPC Endpoints**: Type-safe API with automatic TypeScript inference
- **Authentication**: Session-based auth with role/permission checks
- **Content Management**: CRUD operations for all content types
- **Translation API**: Comprehensive translation management endpoints
- **File Handling**: Secure upload and processing of media files

## Database Architecture

PostgreSQL database with two main schemas:

### Content Schema

- **Courses**: Course structure with parts, chapters, and localized content
- **Resources**: Educational materials (books, videos, tutorials, etc.)
- **Events**: Educational events and workshops
- **Translations**: Complete translation management tables
- **Tags**: Content categorization and metadata

### Users Schema

- **Accounts**: User profiles, authentication, and settings
- **Progress**: Learning progress and completion tracking
- **Translation Management**: Assignments, reviews, and reviewer qualifications
- **Payments**: Course and event payment processing
- **Career**: Career profiles and job matching

## Getting Started

For developers looking to understand the codebase:

1. Start with the [Architecture](./architecture.md) document for a high-level overview
2. Review the [Code Structure](./code-structure.md) to understand organization patterns
3. Explore [Reusable Components](./reusable-components.md) to understand available building blocks
4. If working on the contribute app, see [Reusable Web Components](./reusable-web-components.md) for specific components that can be shared
5. For database work, refer to the [Data Architecture](./data-architecture.md) documentation
6. When building new applications, follow the [Cursor Rules](./cursor-rules.md) for consistent development

## Development Workflow

The project follows modern development practices:

- **Monorepo Management**: pnpm workspaces with TurboRepo
- **Type Safety**: End-to-end TypeScript with strict configuration
- **Code Quality**: Biome for linting and formatting
- **Testing**: Comprehensive test coverage for critical functionality
- **Documentation**: Inline documentation and comprehensive guides

## Deployment

- **Containerization**: Docker support for all applications
- **Environment Management**: Proper environment variable handling
- **Database Migrations**: Automated migration system with Drizzle
- **Content Sync**: Automated synchronization from external sources
