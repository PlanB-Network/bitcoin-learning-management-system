import { sql } from '@blms/database';

export interface TranslationJob {
  id: string;
  courseId: string;
  type: 'upload' | 'translation';
  status:
    | 'pending'
    | 'starting'
    | 'processing'
    | 'polling'
    | 'converting'
    | 'completed'
    | 'failed';
  languages?: string[];
  progress?: string;
  error?: string;
  taskId?: string;
  uploadId?: string;
  totalFiles?: number;
  processedFiles?: number;
  currentFile?: string;
  startedAt: Date;
  completedAt?: Date;
  lastUpdate: Date;
}

/**
 * Create or update a translation job (upsert based on courseId + type)
 */
export const upsertTranslationJobQuery = (
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
) => {
  return sql<TranslationJob[]>`
    INSERT INTO content.translation_jobs (
      course_id,
      type,
      status,
      languages,
      progress,
      error,
      task_id,
      upload_id,
      total_files,
      processed_files,
      current_file,
      completed_at,
      last_update
    ) VALUES (
      ${courseId},
      ${type},
      ${status},
      ${data.languages || null},
      ${data.progress || null},
      ${data.error || null},
      ${data.taskId || null},
      ${data.uploadId || null},
      ${data.totalFiles || null},
      ${data.processedFiles || null},
      ${data.currentFile || null},
      ${data.completedAt || null},
      NOW()
    )
    ON CONFLICT (course_id, type)
    DO UPDATE SET
      status = EXCLUDED.status,
      languages = COALESCE(EXCLUDED.languages, translation_jobs.languages),
      progress = COALESCE(EXCLUDED.progress, translation_jobs.progress),
      error = EXCLUDED.error,
      task_id = COALESCE(EXCLUDED.task_id, translation_jobs.task_id),
      upload_id = COALESCE(EXCLUDED.upload_id, translation_jobs.upload_id),
      total_files = COALESCE(EXCLUDED.total_files, translation_jobs.total_files),
      processed_files = COALESCE(EXCLUDED.processed_files, translation_jobs.processed_files),
      current_file = COALESCE(EXCLUDED.current_file, translation_jobs.current_file),
      completed_at = COALESCE(EXCLUDED.completed_at, translation_jobs.completed_at),
      last_update = NOW()
    RETURNING
      id,
      course_id           AS "courseId",
      type,
      status,
      languages,
      progress,
      error,
      task_id             AS "taskId",
      upload_id           AS "uploadId",
      total_files         AS "totalFiles",
      processed_files     AS "processedFiles",
      current_file        AS "currentFile",
      started_at          AS "startedAt",
      completed_at        AS "completedAt",
      last_update         AS "lastUpdate"
  `;
};

/**
 * Get translation job by courseId and type
 */
export const getTranslationJobQuery = (
  courseId: string,
  type: 'upload' | 'translation',
) => {
  return sql<TranslationJob[]>`
    SELECT
      id,
      course_id           AS "courseId",
      type,
      status,
      languages,
      progress,
      error,
      task_id             AS "taskId",
      upload_id           AS "uploadId",
      total_files         AS "totalFiles",
      processed_files     AS "processedFiles",
      current_file        AS "currentFile",
      started_at          AS "startedAt",
      completed_at        AS "completedAt",
      last_update         AS "lastUpdate"
    FROM content.translation_jobs
    WHERE course_id = ${courseId}
      AND type = ${type}
    ORDER BY started_at DESC
    LIMIT 1
  `;
};

/**
 * Get all translation jobs (for admin jobs dashboard)
 */
export const getAllTranslationJobsQuery = (limit = 50, offset = 0) => {
  return sql<TranslationJob[]>`
    SELECT
      id,
      course_id           AS "courseId",
      type,
      status,
      languages,
      progress,
      error,
      task_id             AS "taskId",
      upload_id           AS "uploadId",
      total_files         AS "totalFiles",
      processed_files     AS "processedFiles",
      current_file        AS "currentFile",
      started_at          AS "startedAt",
      completed_at        AS "completedAt",
      last_update         AS "lastUpdate"
    FROM content.translation_jobs
    ORDER BY started_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
};

/**
 * Get active (non-completed) translation jobs
 */
export const getActiveTranslationJobsQuery = () => {
  return sql<TranslationJob[]>`
    SELECT
      id,
      course_id           AS "courseId",
      type,
      status,
      languages,
      progress,
      error,
      task_id             AS "taskId",
      upload_id           AS "uploadId",
      total_files         AS "totalFiles",
      processed_files     AS "processedFiles",
      current_file        AS "currentFile",
      started_at          AS "startedAt",
      completed_at        AS "completedAt",
      last_update         AS "lastUpdate"
    FROM content.translation_jobs
    WHERE status IN ('pending', 'starting', 'processing', 'polling', 'converting')
    ORDER BY started_at DESC
  `;
};

/**
 * Delete translation job
 */
export const deleteTranslationJobQuery = (
  courseId: string,
  type: 'upload' | 'translation',
) => {
  return sql`
    DELETE FROM content.translation_jobs
    WHERE course_id = ${courseId}
      AND type = ${type}
  `;
};
