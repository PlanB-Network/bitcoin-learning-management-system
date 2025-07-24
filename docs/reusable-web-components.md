# Reusable Components from Web App for Contribute App

This document outlines components, hooks, providers, and utilities from the web application that can be reused in the contribute app. Since both applications will share the same authentication system, header, footer, and design language, many components can be directly reused or adapted with minimal changes.

## Authentication System

The web app has a complete authentication system that can be directly reused:

### Authentication Components

Located in `apps/web/src/components/AuthModals/`:

- **auth-modal.tsx**: Main modal wrapper for authentication
- **register.tsx**: Registration form component
- **sign-in.tsx**: Sign-in form component
- **password-reset.tsx**: Password reset functionality
- **props.ts**: Shared authentication props and enums

### Authentication Context

Located in `apps/web/src/providers/`:

- **auth.tsx**: Authentication state management
  - Manages modal state (open/closed)
  - Handles switching between authentication modes (login/register/reset)

## Header Components

Located in `apps/web/src/components/Header/`:

- **header.tsx**: Main header component with navigation
- **language-selector.tsx**: Language selection dropdown
- **menu-elements.tsx**: Navigation menu items
- **meta-elements.tsx**: Meta navigation elements
- **notifications-panel.tsx**: User notifications panel
- **props.ts**: Header component props and types
- **FlyingMenu/**: Dropdown menu components
- **MobileMenu/**: Mobile-responsive navigation

## Hooks

Located in `apps/web/src/hooks/`:

- **use-disclosure.ts**: Toggle state management (open/closed)
- **use-greater.ts**: Media query hook for larger screens
- **use-smaller.ts**: Media query hook for smaller screens
- **use-trpc.ts**: tRPC client setup and configuration
- **use-navigate-misc.ts**: Navigation utilities

## Providers

Located in `apps/web/src/providers/`:

- **app.tsx**: Main application provider
  - Wraps the application with necessary context providers
  - Sets up TanStack Router, React Query, and tRPC
  - Manages language switching and detection
- **context.tsx**: Application context for global state
  - User session management
  - User data access
- **conversionRateContext.tsx**: Currency conversion functionality
- **userNotificationsContext.tsx**: User notifications state
- **auth.tsx**: Authentication state management

## Utilities

Located in `apps/web/src/utils/`:

- **i18n.ts**: Internationalization setup and language constants
- **trpc.ts**: tRPC client configuration
- **session-utils.ts**: Session management utilities
- **date.ts**: Date formatting and manipulation utilities
- **string.ts**: String manipulation helpers
- **http.ts**: HTTP request helpers
- **meta.ts**: Metadata constants

## Internationalization

The web app has a comprehensive internationalization system that can be reused:

- **i18n setup**: Located in `apps/web/src/utils/i18n.ts`
- **Translation files**: Located in `apps/web/public/locales/`
  - Existing translations for authentication, navigation, and common UI elements
  - Language detection and switching functionality

## Styling and Design System

Both applications should share the same design system:

- **UI components**: From the shared `@blms/ui` package
- **TailwindCSS configuration**: Consistent styling approach
- **Global styles**: From the UI package

## Integration Plan

To effectively use these components in the contribute app:

1. **Create a shared components library**: Move common components to the `packages` directory
   - Authentication components
   - Header/navigation components
   - Common hooks and utilities

2. **Share providers**: Either move providers to a shared package or ensure they're implemented consistently

3. **Use the same i18n setup**: Ensure translation files are shared or have a consistent format

4. **Maintain consistent styling**: Use the same design system and UI components

## Implementation Steps

1. Identify components that need to be used as-is vs. those needing adaptation
2. Refactor shared components into the appropriate packages
3. Set up the contribute app with the same provider structure
4. Implement app-specific features while leveraging shared components

By reusing these components, the contribute app can maintain consistency with the main web app while focusing on implementing features specific to contributors.
