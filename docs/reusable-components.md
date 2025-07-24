# Reusable Components and Features

This document provides a comprehensive guide to the reusable components and features available in the Bitcoin Learning Management System. These components can be leveraged in other applications with minimal modification.

## UI Components

The UI package (`packages/ui`) follows atomic design principles and contains a variety of reusable components:

### Atoms

Basic building blocks of the UI:

- **Button**: Customizable button component with various styles and states
- **Input**: Form input fields with validation support
- **Select**: Dropdown selection component
- **Carousel**: Image/content carousel component
- **Divider**: Visual separator component
- **Form**: Form wrapper with validation handling
- **Label**: Form label component
- **Progress**: Progress indicator component
- **Slider**: Range selection component
- **Tag**: Tag/badge component for displaying metadata

### Styling System

- **TailwindCSS Configuration**: Custom design system implemented with Tailwind
- **Global Styles**: Base styles and typography settings
- **Theme Support**: Light/dark mode and custom theme variants

## Frontend Architecture

### Routing System

The application uses TanStack Router for file-based routing:

- **File Structure**: Routes defined as files in the directory structure
- **Route Tree**: Automatically generated route tree
- **Layouts**: Nested route layouts for consistent UI
- **Internationalization**: Route patterns for multi-language support with `$lang` parameter
- **Dynamic Routes**: Parameter-based dynamic routes (e.g., `$courseId`, `$blogName`)

### State Management

- **React Context Providers**:
  - `AppContextProvider`: Application-wide state
  - `AuthModalProvider`: Authentication UI state
  - `ConversionRateProvider`: Currency conversion
  - `NotificationsProvider`: User notifications

- **TanStack Query Integration**: Data fetching and server state management
  - Custom hooks for common queries
  - Query invalidation patterns

### Authentication

- **Authentication Modals**: Reusable sign-in/sign-up components
- **Session Management**: User session handling
- **Protected Routes**: Route protection based on authentication status

### UI Features

- **Header Components**: Navigation header with responsive behavior
  - `FlyingMenu`: Animated dropdown menu
  - `MobileMenu`: Mobile-friendly navigation

- **Calendar**: Event scheduling and display component
- **Chart**: Data visualization components
- **Comments**: Commenting system for content
- **Markdown**: Rich text rendering with code highlighting
- **Tabs**: Content organization with tabbed interface

## API Integration

### tRPC Setup

- **Client Configuration**: Type-safe API client setup
- **Query Hooks**: Reusable data fetching hooks
- **Mutation Hooks**: Data modification patterns

### Content Services

Services for managing different types of content:

- **Course Management**: Course creation, editing, and enrollment
- **Resource Management**: Books, videos, podcasts, and other learning resources
- **Event Management**: Scheduling and managing educational events
- **Blog/News Management**: Publishing and managing articles

### User Services

- **Account Management**: User profile and settings
- **Billing Services**: Payment processing and subscription management
- **Notification System**: User notifications for various events
- **Career Services**: Job and career opportunity tracking

## Development Utilities

### TypeScript Configuration

- **Path Aliases**: Import path simplification (`#src/*`)
- **Type Definitions**: Shared type definitions for consistency

### Build and Deployment

- **Vite Configuration**: Optimized build process
- **Docker Setup**: Containerization for various services
- **Environment Configuration**: Development/production environment management

## Internationalization

- **i18n Setup**: Multi-language support infrastructure
- **Translation Management**: Organized translation files
- **Language Detection**: Automatic user language detection
- **Language Switching**: In-app language change with route updates

## Conclusion

These reusable components and features provide a solid foundation for building educational platforms and content-rich applications. By leveraging this architecture, developers can accelerate the development of similar applications while maintaining a consistent user experience and robust technical implementation.
