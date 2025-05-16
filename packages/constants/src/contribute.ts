/**
 * Permissions specific to the contribute app
 */
export enum ContributePermission {
  Reviewer = 'contribute:reviewer',
  Assign = 'contribute:assign',
}

/**
 * Status for translation workflow
 */
export enum TranslationStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  ReadyForReview = 'ready_for_review',
  UnderReview = 'under_review',
  Reviewed = 'reviewed',
  Published = 'published',
}

/**
 * Status for translation reviews
 */
export enum ReviewStatus {
  Approved = 'approved',
  Rejected = 'rejected',
  NeedsChanges = 'needs_changes',
}

/**
 * Roles for translation assignments
 */
export enum AssignmentRole {
  Contributor = 'contributor',
}

/**
 * Status for translation assignments
 */
export enum AssignmentStatus {
  Requested = 'requested',
  Assigned = 'assigned',
  InProgress = 'in_progress',
  Completed = 'completed',
  Rejected = 'rejected',
}
