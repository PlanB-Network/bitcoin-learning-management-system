import { AssignmentStatus, TranslationStatus } from '@blms/constants';
import { z } from 'zod';

// Translation status enum schema
export const translationStatusEnum = z.enum(TranslationStatus);

// Assignment status enum schema
export const assignmentStatusEnum = z.enum(AssignmentStatus);
