import { TranslationStatus } from '@blms/constants';
import { z } from 'zod';

// Translation status enum schema
export const translationStatusEnum = z.enum([
  TranslationStatus.Todo,
  TranslationStatus.InProgress,
  TranslationStatus.ReadyForReview,
  TranslationStatus.UnderReview,
  TranslationStatus.Reviewed,
  TranslationStatus.Published,
]);

// Assignment status enum schema
export const assignmentStatusEnum = z.enum([
  'requested',
  'assigned',
  'in_progress',
  'completed',
  'rejected',
]);
