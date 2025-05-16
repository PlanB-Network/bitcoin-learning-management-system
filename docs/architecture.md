# Bitcoin Learning Management System Architecture

## Overview

The Bitcoin Learning Management System (BLMS) is a comprehensive monorepo-based application designed to deliver educational content related to Bitcoin. The system consists of multiple applications and shared packages that work together to provide a cohesive learning experience.

## Repository Structure

The repository follows a monorepo structure using pnpm workspaces:

```
bitcoin-learning-management-system/
├── apps/                      # Application packages
│   ├── api/                   # Backend API service
│   ├── contribute/            # Contribution platform
│   └── web/                   # Main web application
├── packages/                  # Shared packages
│   ├── constants/             # Shared constants
│   ├── database/              # Database models and migrations
│   ├── schemas/               # Shared schema definitions
│   ├── service-common/        # Common services
│   ├── service-content/       # Content management services
│   ├── service-user/          # User management services
│   ├── shared/                # Shared utilities
│   ├── types/                 # TypeScript type definitions
│   └── ui/                    # Shared UI components
└── docs/                      # Documentation
```

## Applications

### Web Application (`apps/web`)

The main web application serves as the primary interface for users to access educational content.

#### Key Technologies:

- **React**: Frontend library for building user interfaces
- **TypeScript**: Type-safe JavaScript
- **TanStack Router**: File-based routing solution
- **TanStack Query**: Data fetching and state management
- **tRPC**: End-to-end typesafe API
- **Tailwind CSS**: Utility-first CSS framework
- **i18n**: Internationalization support

#### Architecture:

The web application follows a component-based architecture with a clear separation of concerns:

1. **File-based Routing**: Routes are defined as files in the `src/routes` directory, organized by language and content type.
2. **Component Structure**:
   - **Atoms**: Smallest UI components (buttons, inputs, etc.)
   - **Molecules**: Combinations of atoms forming more complex components
   - **Organisms**: Larger, self-contained components
   - **Components**: Reusable UI elements
3. **State Management**: Combination of React Context and TanStack Query for global and server state management
4. **Services**: API integration and data handling

### API Application (`apps/api`)

Backend service providing API endpoints for both web and contribute applications.

#### Key Technologies:

- **Node.js**: JavaScript runtime
- **tRPC**: End-to-end typesafe API
- **Drizzle ORM**: Database ORM
- **PostgreSQL**: Database with schema separation

#### Architecture:

- **Routers**: Organized API endpoints by domain (content, user, auth)
- **Procedures**: tRPC procedures for handling requests
- **Middlewares**: Request processing middleware (auth, session, permissions)
- **Services**: Business logic implementation

### Contribute Application (`apps/contribute`)

Platform for contributors to manage and translate educational content.

#### Key Technologies:

- **React**: Frontend library (same as web app)
- **TypeScript**: Type-safe JavaScript
- **TanStack Router**: File-based routing solution
- **TanStack Query**: Data fetching and state management
- **tRPC**: End-to-end typesafe API
- **Tailwind CSS**: Utility-first CSS framework
- **i18n**: Internationalization support

#### Architecture:

The contribute application follows the same architectural patterns as the web app but focuses on content management:

1. **Shared Components**: Reuses authentication, header, and common UI components from the web app
2. **Content Management**: Specialized components for translation workflows, content editing, and review processes
3. **Translation System**: Integration with the database translation schema for managing course translations
4. **Contributor Dashboard**: Dedicated interface for managing translation assignments and progress

#### Key Features:

- **Translation Management**: Interface for translating courses, parts, and chapters
- **Review System**: Workflow for reviewing and approving translations
- **Assignment System**: Assigning translation tasks to contributors
- **Progress Tracking**: Monitoring translation status and completion

## Shared Packages

### Database Package (`packages/database`)

Centralized database schema and operations:

- **Schema Definition**: Drizzle ORM schema with proper type safety
- **Migrations**: Database migration files and management
- **Client**: PostgreSQL client with helper functions
- **Translation Schema**: Extended schema for content translation management

### UI Package (`packages/ui`)

Reusable UI component library following atomic design principles:

- **Atoms**: Basic building blocks like buttons, inputs, and labels
- **Lib**: Utility functions for UI components
- **Styles**: Global styles and theming

### Service Packages

- **service-content**: Content management services and queries
- **service-user**: User management services and queries
- **service-common**: Shared service utilities

### Other Packages

- **types**: TypeScript type definitions
- **schemas**: Zod schemas for validation
- **constants**: Shared constants across applications
- **shared**: Common utilities and helpers

## Key Architectural Patterns

1. **Monorepo Structure**: Shared code and dependencies across applications
2. **Component-Based Design**: Atomic design principles for UI components
3. **Type Safety**: End-to-end type safety with TypeScript and tRPC
4. **File-Based Routing**: Intuitive route organization based on file structure
5. **Internationalization**: Multi-language support throughout the application
6. **Service-Oriented**: Clear separation of business logic into services
7. **Schema Separation**: Database schemas organized by domain (content, users)

## Reusable Components

### UI Components

The UI package provides a comprehensive set of reusable components:

- **Atoms**: Button, Input, Select, Carousel, Divider, Form, Label, Progress, Slider, Tag
- **Styling**: TailwindCSS configuration and theming

### Frontend Features

- **Authentication**: User authentication and authorization flow (shared between apps)
- **Routing**: TanStack Router configuration for file-based routing
- **Data Fetching**: TanStack Query integration with tRPC
- **Internationalization**: i18n setup with language detection and switching
- **Layout Components**: Header, FlyingMenu, MobileMenu (shared between apps)

### Backend Services

- **Content Management**: Services for managing educational content
- **Translation Management**: Services for handling content translations
- **User Management**: User account, billing, and notification services
- **API Integration**: tRPC setup for type-safe API calls

## Development Workflow

The project uses:

- **pnpm**: Package management with workspaces
- **Vite**: Frontend build tool
- **TurboRepo**: Monorepo build system
- **TypeScript**: Type checking
- **Biome**: Linting and formatting
- **Docker**: Containerization for development and deployment

## Conclusion

The Bitcoin Learning Management System is built with a focus on modularity, reusability, and type safety. The monorepo structure allows for code sharing between applications while maintaining clear boundaries between different concerns.

The architecture supports scalability, maintainability, and developer productivity through well-defined patterns and modern tooling. The contribute app extends the platform's capabilities by providing specialized tools for content management and translation workflows.
