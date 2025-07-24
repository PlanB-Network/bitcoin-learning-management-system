# Contribute App Implementation: Course Translation and Review System

This document outlines the implementation approach for extending the Contribute App to support course translations and a multi-level review system. The goal is to create a workflow where courses can be translated, reviewed, and validated before being published to the main Web app.

## Table of Contents

1. [System Overview](#system-overview)
2. [User Roles and Permissions](#user-roles-and-permissions)
3. [Translation Workflow](#translation-workflow)
4. [Technical Implementation](#technical-implementation)
5. [Data Architecture](#data-architecture)
6. [UI/UX Considerations](#uiux-considerations)
7. [Integration with Existing Systems](#integration-with-existing-systems)
8. [Implementation Roadmap](#implementation-roadmap)

## System Overview

The Course Translation and Review System will extend the current Contribute App to facilitate the translation of courses into different languages. The system will implement a multi-step review process to ensure quality translations before they are published to the main BLMS platform.

Key features include:
- Permission-based access control for contributors with review capabilities
- Course translation assignment and tracking
- Multi-level review workflow
- Translation progress tracking
- Integration with the existing course content system

## User Roles and Permissions

We will extend the current permission system to include new capabilities for contributors:

### Permission Sets

All users of the Contribute App will have the 'contributor' role. Different permission sets will determine their capabilities. Contributors can have all permissions available in the current Web app plus these new ones:

1. **Reviewer Permissions** (`contribute:reviewer`):
   - Can select languages for translation
   - Can submit course translations
   - Can review course translations (excluding their own)
   - Can see courses ready for translation

2. **Super Reviewer Permissions** (`contribute:super_reviewer`):
   - All reviewer permissions
   - Performs initial validation of translations
   - Can approve final translations

3. **Assignment Permissions** (`contribute:assign`):
   - Can assign courses to contributors
   - Can track translation progress
   - Administration of the review process

### Permission Implementation

We'll add new permissions to the existing `UserPermission` enum:

```typescript
export enum UserPermission {
  Bookings = 'admin:bookings',
  Career = 'admin:career',
  Courses = 'admin:courses',
  Quizzes = 'admin:quizzes',
  Coupons = 'admin:coupons',
  Tutorials = 'admin:tutorials',
  Reviewer = 'contribute:reviewer',        // New permission
  SuperReviewer = 'contribute:super_reviewer', // New permission
  Assign = 'contribute:assign'             // New permission
}
```

## Translation Workflow

The translation and review process will follow these steps:

1. **Course Selection**:
   - Admin adds a course for translation
   - Contributors with assignment permissions can select courses for translation

2. **Language Assignment**:
   - Contributors can select languages they want to translate
   - Contributors with assignment permissions can assign specific languages to other contributors

3. **Translation Process**:
   - Contributor translates course content
   - System tracks translation progress

4. **Initial Review**:
   - Contributor with super reviewer permissions performs the first review
   - Super reviewer permissions must be granted by an admin

5. **Secondary Reviews**:
   - Two different contributors with reviewer permissions must review the translation
   - Contributors cannot review their own translations

6. **Final Approval**:
   - When two positive reviews are received, the course is marked as validated
   - System prepares the translation for publishing to the main Web app

7. **Publishing**:
   - Validated translations are published to the main platform
   - Original course data is updated with the new language version

## Technical Implementation

### Backend (API Application)

1. **New tRPC Procedures**:
   - Create a new router for translation management
   - Implement procedures for translation assignment, submission, and review
   - Add authorization middleware for the new permissions

2. **Database Access**:
   - Create new database services for translation management
   - Implement queries for tracking translation progress
   - Set up the validation workflow tracking

### Frontend (Contribute Application)

1. **Translation Management UI**:
   - Course selection interface
   - Translation editor with preview
   - Progress tracking dashboard
   - Review interface with feedback system

2. **User Dashboards**:
   - Contributor dashboard showing assigned translations
   - Reviewer and super reviewer dashboards for contributors with those permissions
   - Admin dashboard for oversight

3. **Authentication and Authorization**:
   - Extend authentication to handle permission checks
   - Implement permission checks for translation workflows

## Data Architecture

The following new tables will be added to the database schema:

### Translation Management Tables

#### content.course_translations
Table principale pour les traductions de cours.

#### content.course_translation_chapters
Table pour les traductions de chapitres de cours.

### Tables d'assignation

#### users.translation_assignments
Table pour les assignations de traduction au niveau cours.

#### users.translation_chapter_assignments
Table pour gérer les assignations de traduction au niveau des chapitres.

**Colonnes principales :**
- `course_id` : ID du cours
- `language` : Langue de traduction
- `part_id` : ID de la partie (référence directe à course_parts.part_id)
- `chapter_id` : ID du chapitre
- `assignee_id` : ID de l'utilisateur assigné
- `assigner_id` : ID de l'utilisateur qui a fait l'assignation
- `status` : Statut de l'assignation (requested, assigned, in_progress, completed)
- `assigned_at` : Date d'assignation
- `completed_at` : Date de completion
- `rejection_reason` : Raison du rejet (si applicable)

**Relations :**
- Référence `course_translations` via (course_id, language)
- Référence `course_translation_chapters` via (course_id, language, part_id, chapter_id)
- Référence `course_parts` via part_id
- Référence `course_chapters` via chapter_id
- Référence `accounts` pour assignee_id et assigner_id

**Contraintes :**
- Clé unique sur (course_id, language, part_id, chapter_id, assignee_id)

### Entity Relationships

- Each course can have multiple translations (one per language)
- Each translation has multiple parts and chapters matching the course structure
- Users can be assigned to translations with specific assignment types
- Each translation requires one super reviewer approval and two reviewer approvals from contributors with appropriate permissions
- All users share the same 'contributor' role in the system, with different permissions and assignment types determining their capabilities

## UI/UX Considerations

### User Interfaces

1. **Course Translation Interface**:
   - Side-by-side display of original and translated content
   - WYSIWYG markdown editor with preview
   - Progress indicators
   - Auto-save functionality

2. **Review Interface**:
   - Side-by-side comparison of original and translated content
   - Comment system for feedback
   - Approval/rejection buttons
   - Change request system

3. **Dashboard**:
   - Translation progress overview
   - Assigned courses and languages
   - Review tasks and deadlines
   - Notification system for updates

### User Experience

1. **Translator Experience**:
   - Intuitive editor with context
   - Clear status indicators
   - Translation memory/suggestions
   - Easy navigation between sections

2. **Contributor Review Experience**:
   - Focused review interface
   - Efficient approval workflow
   - Feedback templates
   - Quick communication with translators

## Integration with Existing Systems

### Authentication Integration

- Utilize the existing authentication system
- Extend permission-based access controls
- Integrate with current user profile management

### Content System Integration

- Access the existing course structure
- Preserve content relationships
- Ensure translation consistency

### Web App Integration

- Implement a publishing mechanism to the main platform
- Maintain content versioning
- Ensure seamless content updates

## Implementation Roadmap

### Phase 1: Foundation

1. Database schema updates
2. Permission system extensions
3. Basic translation management interfaces

### Phase 2: Core Functionality

1. Translation editor implementation
2. Review system development
3. Progress tracking implementation

### Phase 3: Workflow and Integration

1. Complete review workflow implementation
2. Integration with main platform
3. Publishing mechanism

### Phase 4: Refinement

1. UX improvements
2. Performance optimization
3. Additional features and tools for translators
