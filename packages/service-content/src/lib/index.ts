import type { ChangedFile } from '@blms/types';

import {
  createDeleteBCertificateExams,
  createUpdateBCertificateExams,
  groupByBCertificateExam,
} from './bcertificate/import/index.js';
import {
  createDeleteBlogs,
  createUpdateBlogs,
  groupByBlog,
} from './blogs/import/index.js';
import { supportedContentTypes } from './const.js';
import {
  createDeleteCourses,
  createUpdateCourses,
  groupByCourse,
} from './courses/import/index.js';
import type { Dependencies } from './dependencies.js';
import {
  createDeleteEvents,
  createUpdateEvents,
  groupByEvent,
} from './events/import/index.js';
import {
  createDeleteLegals,
  createUpdateLegals,
  groupByLegal,
} from './legals/import/index.js';
import {
  createDeleteProfessors,
  createUpdateProfessors,
  groupByProfessor,
} from './professors/import/index.js';
import { createDeleteProofreadings } from './proofreadings/import/index.js';
import {
  createDisableQuizQuestions,
  createUpdateQuizQuestions,
  groupByQuizQuestion,
} from './quizzes/questions/import/index.js';
import {
  createDeleteResources,
  createUpdateResources,
  groupByResource,
} from './resources/import/index.js';
import {
  createDeleteTutorials,
  createUpdateTutorials,
  groupByTutorial,
} from './tutorials/import/index.js';

/**
 * Updates the database from the content files
 */
export const createProcessContentFiles = (dependencies: Dependencies) => {
  const deleteProofreadings = createDeleteProofreadings(dependencies);
  const updateResources = createUpdateResources(dependencies);
  const updateCourses = createUpdateCourses(dependencies);
  const updateTutorials = createUpdateTutorials(dependencies);
  const updateQuizQuestions = createUpdateQuizQuestions(dependencies);
  const updateProfessors = createUpdateProfessors(dependencies);
  const updateEvents = createUpdateEvents(dependencies);
  const updateBCertificates = createUpdateBCertificateExams(dependencies);
  const updateBlogs = createUpdateBlogs(dependencies);
  const updateLegals = createUpdateLegals(dependencies);

  return async (
    files: ChangedFile[],
  ): Promise<{ errors: string[]; warnings: string[] }> => {
    const filteredFiles = files.filter((file) =>
      supportedContentTypes.some((value) => file.path.startsWith(value)),
    );
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log(`-- Sync procedure: Deleteing proofreadings`);
    await deleteProofreadings(errors);

    const resources = groupByResource(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${resources.length} resources`);
    for (const resource of resources) {
      await updateResources(resource, errors);
    }

    const courses = groupByCourse(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${courses.length} courses`);
    for (const course of courses) {
      await updateCourses(course, errors);
    }

    const legals = groupByLegal(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${legals.length} legals`);
    for (const legal of legals) {
      await updateLegals(legal, errors);
    }

    const tutorials = groupByTutorial(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${tutorials.length} tutorials`);
    for (const tutorial of tutorials) {
      await updateTutorials(tutorial, errors);
    }

    const blogs = groupByBlog(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${blogs.length} blogs`);
    for (const blog of blogs) {
      await updateBlogs(blog, errors);
    }

    const quizQuestions = groupByQuizQuestion(filteredFiles, errors);
    console.log(
      `-- Sync procedure: Syncing ${quizQuestions.length} quizQuestions`,
    );
    for (const quizQuestion of quizQuestions) {
      await updateQuizQuestions(quizQuestion, errors);
    }

    const professors = groupByProfessor(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${professors.length} professors`);
    for (const professor of professors) {
      await updateProfessors(professor, errors);
    }

    const events = groupByEvent(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${events.length} events`);
    for (const event of events) {
      await updateEvents(event, errors);
    }

    const bCertificates = groupByBCertificateExam(filteredFiles, errors);
    console.log(
      `-- Sync procedure: Syncing ${bCertificates.length} B Certificates exams`,
    );
    for (const bCertificate of bCertificates) {
      await updateBCertificates(bCertificate, errors);
    }

    return { errors, warnings };
  };
};

export const createProcessDeleteOldEntities = (dependencies: Dependencies) => {
  const deleteProfessors = createDeleteProfessors(dependencies);
  const deleteCourses = createDeleteCourses(dependencies);
  const deleteTutorials = createDeleteTutorials(dependencies);
  const deleteResources = createDeleteResources(dependencies);
  const deleteEvents = createDeleteEvents(dependencies);
  const deleteBCertificates = createDeleteBCertificateExams(dependencies);
  const deleteBlogs = createDeleteBlogs(dependencies);
  const deleteLegals = createDeleteLegals(dependencies);

  return async (sync_date: number, errors: string[]) => {
    const timeKey = '-- Sync procedure: Removing old entities';
    console.log(timeKey + '...');
    console.time(timeKey);

    await deleteProfessors(sync_date, errors);
    await deleteCourses(sync_date, errors);
    await deleteTutorials(sync_date, errors);
    await deleteResources(sync_date, errors);
    await deleteEvents(sync_date, errors);
    await deleteBCertificates(sync_date, errors);
    await deleteBlogs(sync_date, errors);
    await deleteLegals(sync_date, errors);

    console.timeEnd(timeKey);
  };
};

export const createProcessDisableOldEntities = (dependencies: Dependencies) => {
  const disableQuizQuestions = createDisableQuizQuestions(dependencies);

  return async (sync_date: number, errors: string[]) => {
    const timeKey = '-- Sync procedure: Disabling old entities';
    console.log(timeKey + '...');
    console.time(timeKey);

    await disableQuizQuestions(sync_date, errors);

    console.timeEnd(timeKey);
  };
};
