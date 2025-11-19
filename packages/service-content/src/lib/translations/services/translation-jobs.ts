import type { Dependencies } from '../../dependencies.js';
import {
  deleteTranslationJobQuery,
  getActiveTranslationJobsQuery,
  getAllTranslationJobsQuery,
  getTranslationJobQuery,
  type TranslationJob,
  upsertTranslationJobQuery,
} from '../queries/translation-jobs.js';

/**
 * Upsert a translation job (create or update)
 */
export const createUpsertTranslationJob = (dependencies: Dependencies) => {
  return async (
    courseId: string,
    type: 'upload' | 'translation',
    status:
      | 'pending'
      | 'starting'
      | 'processing'
      | 'polling'
      | 'converting'
      | 'completed'
      | 'failed',
    data: {
      languages?: string[];
      progress?: string;
      error?: string;
      taskId?: string;
      uploadId?: string;
      totalFiles?: number;
      processedFiles?: number;
      currentFile?: string;
      completedAt?: Date;
    },
  ): Promise<TranslationJob | null> => {
    const results = await dependencies.postgres.exec(
      upsertTranslationJobQuery(courseId, type, status, data),
    );
    return results[0] || null;
  };
};

/**
 * Get translation job by courseId and type
 */
export const createGetTranslationJob = (dependencies: Dependencies) => {
  return async (
    courseId: string,
    type: 'upload' | 'translation',
  ): Promise<TranslationJob | null> => {
    const results = await dependencies.postgres.exec(
      getTranslationJobQuery(courseId, type),
    );
    return results[0] || null;
  };
};

/**
 * Get all translation jobs (for admin dashboard)
 */
export const createGetAllTranslationJobs = (dependencies: Dependencies) => {
  return async (limit = 50, offset = 0): Promise<TranslationJob[]> => {
    return dependencies.postgres.exec(
      getAllTranslationJobsQuery(limit, offset),
    );
  };
};

/**
 * Get active (non-completed) translation jobs
 */
export const createGetActiveTranslationJobs = (dependencies: Dependencies) => {
  return async (): Promise<TranslationJob[]> => {
    return dependencies.postgres.exec(getActiveTranslationJobsQuery());
  };
};

/**
 * Delete translation job
 */
export const createDeleteTranslationJob = (dependencies: Dependencies) => {
  return async (
    courseId: string,
    type: 'upload' | 'translation',
  ): Promise<void> => {
    await dependencies.postgres.exec(deleteTranslationJobQuery(courseId, type));
  };
};
