import type { Dependencies } from '../../dependencies.js';
import {
  createCourseTranslationUploadQuery,
  getCourseTranslationUploadByIdQuery,
  getCourseTranslationUploadsQuery,
  updateCourseTranslationUploadQuery,
} from '../queries/course-translation-uploads.js';

/**
 * Service to create a new course translation upload
 */
export const createCreateCourseTranslationUpload = ({
  postgres,
}: Dependencies) => {
  return async (
    courseId: string,
    originalLanguage: string,
    translateLanguages: string[],
    uploaderId: string,
    pptxFileUrl?: string,
    audioFileUrl?: string,
  ) => {
    const result = await postgres.exec(
      createCourseTranslationUploadQuery(
        courseId,
        originalLanguage,
        translateLanguages,
        uploaderId,
        pptxFileUrl,
        audioFileUrl,
      ),
    );

    return result[0];
  };
};

/**
 * Service to update a course translation upload
 */
export const createUpdateCourseTranslationUpload = ({
  postgres,
}: Dependencies) => {
  return async (
    id: string,
    pptxFileUrl?: string,
    audioFileUrl?: string,
    uploadSuccess?: boolean,
    errorMessage?: string,
  ) => {
    const result = await postgres.exec(
      updateCourseTranslationUploadQuery(
        id,
        pptxFileUrl,
        audioFileUrl,
        uploadSuccess,
        errorMessage,
      ),
    );

    return result[0];
  };
};

/**
 * Service to get course translation uploads for a specific course
 */
export const createGetCourseTranslationUploads = ({
  postgres,
}: Dependencies) => {
  return async (courseId: string) => {
    return await postgres.exec(getCourseTranslationUploadsQuery(courseId));
  };
};

/**
 * Service to get a specific course translation upload by ID
 */
export const createGetCourseTranslationUploadById = ({
  postgres,
}: Dependencies) => {
  return async (id: string) => {
    const result = await postgres.exec(getCourseTranslationUploadByIdQuery(id));
    return result[0] || null;
  };
};
