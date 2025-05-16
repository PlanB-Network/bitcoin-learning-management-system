# Code Structure and Organization

This document explains the code structure and organization patterns used in the Bitcoin Learning Management System. Understanding these patterns will help developers navigate and extend the codebase effectively.

## Monorepo Structure

The project is organized as a monorepo using pnpm workspaces. This approach facilitates code sharing and dependency management across multiple applications and packages.

### Root Directory

```
bitcoin-learning-management-system/
├── .github/                  # GitHub workflows and CI/CD configuration
├── .husky/                   # Git hooks for code quality
├── apps/                     # Application packages
├── packages/                 # Shared packages
├── docs/                     # Documentation
├── scripts/                  # Development and build scripts
├── docker/                   # Docker configuration
├── compose.yml               # Docker Compose configuration
├── package.json              # Root package configuration
└── pnpm-workspace.yaml       # Workspace configuration
```

### Apps Directory

The `apps` directory contains standalone applications:

```
apps/
├── api/                      # Backend API service
│   ├── src/
│   │   ├── middlewares/      # Express/tRPC middlewares
│   │   ├── procedures/       # tRPC procedure definitions
│   │   ├── routers/          # API route definitions
│   │   ├── services/         # Business logic services
│   │   ├── trpc/             # tRPC configuration
│   │   └── utils/            # Utility functions
│   └── package.json
├── contribute/               # Contribution platform
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/            # React hooks
│   │   ├── routes/           # Application routes
│   │   └── utils/            # Utility functions
│   └── package.json
└── web/                      # Main web application
    ├── src/
    │   ├── assets/           # Static assets
    │   ├── components/       # UI components
    │   ├── hooks/            # React hooks
    │   ├── molecules/        # Molecule components
    │   ├── organisms/        # Organism components
    │   ├── providers/        # Context providers
    │   ├── routes/           # Application routes
    │   ├── services/         # API service integrations
    │   └── utils/            # Utility functions
    └── package.json
```

### Packages Directory

The `packages` directory contains shared code used across applications:

```
packages/
├── constants/                # Shared constants
├── database/                 # Database models and operations
│   ├── drizzle/              # Drizzle ORM migrations
│   └── src/                  # Database schema and queries
├── schemas/                  # Zod schemas for validation
├── service-common/           # Common service utilities
├── service-content/          # Content management services
│   └── src/
│       └── lib/
│           ├── bcert/        # Certificate services
│           ├── blogs/        # Blog content services
│           ├── courses/      # Course content services
│           ├── events/       # Event services
│           └── resources/    # Learning resources services
├── service-user/             # User management services
│   └── src/
│       └── lib/
│           ├── account/      # User account services
│           ├── billing/      # Billing services
│           └── notifications/# Notification services
├── shared/                   # Shared utilities
├── types/                    # TypeScript type definitions
└── ui/                       # Shared UI components
    └── src/
        ├── atoms/            # Atomic UI components
        ├── lib/              # UI utilities
        └── styles/           # Global styles
```

## Web Application Structure

The web application follows a structured organization pattern:

### Component Organization

Components are organized following atomic design principles:

1. **Atoms**: Smallest UI building blocks (in `packages/ui/src/atoms/`)
2. **Molecules**: Combinations of atoms (in `apps/web/src/molecules/`)
3. **Organisms**: Complex UI components (in `apps/web/src/organisms/`)
4. **Components**: General purpose components (in `apps/web/src/components/`)

### Route Structure

Routes are organized in a file-based structure using TanStack Router:

```
src/routes/
├── __root.tsx               # Root route layout
├── $lang/                   # Language-specific routes
│   ├── index.tsx            # Homepage for each language
│   ├── dashboard/           # User dashboard routes
│   │   ├── _dashboard.tsx   # Dashboard layout
│   │   └── ...              # Dashboard pages
│   └── _content/            # Content routes
│       ├── courses/         # Course-related routes
│       ├── events/          # Event-related routes
│       ├── resources/       # Resource-related routes
│       ├── search/          # Search functionality
│       ├── tutorials/       # Tutorial-related routes
│       └── _misc/           # Miscellaneous pages
```

The routing structure uses conventions:

- Files starting with `$` define dynamic route parameters (e.g., `$lang`, `$courseId`)
- Files starting with `_` define layout routes or grouping
- `index.tsx` files define the default route for a directory

### State Management

The application uses a combination of:

1. **React Context**: For global UI state
   - Located in `apps/web/src/providers/`

2. **TanStack Query + tRPC**: For server state
   - Hooks in `apps/web/src/hooks/`

## API Structure

The API follows a domain-driven organization:

### Router Organization

```
src/routers/
├── auth/                    # Authentication endpoints
├── content/                 # Content management endpoints
├── rest/                    # REST API endpoints
└── user/                    # User management endpoints
```

### Service Organization

Services are organized by domain and functionality:

```
packages/service-content/src/lib/
├── bcert/                   # Certificate services
│   ├── import/              # Data import logic
│   ├── queries/             # Database queries
│   └── services/            # Business logic
├── courses/                 # Course management
└── ...
```

## Common Patterns

### Import Aliases

The codebase uses path aliases to simplify imports:

```typescript
// Instead of relative paths
import { Button } from '../../../components/Button';

// Using path aliases
import { Button } from '#src/components/Button';
```

### File Naming Conventions

- Component files: PascalCase (e.g., `Button.tsx`)
- Utility files: camelCase (e.g., `formatDate.ts`)
- Route files: kebab-case or special prefixes (e.g., `$courseId.tsx`, `_dashboard.tsx`)
- Index files for directory exports: `index.ts`

### Module Organization

Modules typically follow this structure:

```
module/
├── components/              # Module-specific components
├── hooks/                   # Module-specific hooks
├── utils/                   # Module-specific utilities
└── index.ts                 # Public API exports
```

## Conclusion

Understanding the structure and organization of the codebase is essential for effective development. The patterns described here provide a consistent approach to code organization that promotes maintainability and scalability.

By following these conventions when extending the application, developers can ensure their contributions integrate seamlessly with the existing codebase.
