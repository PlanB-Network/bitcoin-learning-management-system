import type { ChangedAsset, ChangedFile } from '@blms/types';

import {
  createDeleteBCertExams,
  createUpdateBCertExams,
  groupByBCertExam,
} from './bcert/import/index.js';
import {
  createDeleteBlogs,
  createUpdateBlogs,
  groupByBlog,
} from './blogs/import/index.js';
import { supportedContentTypes } from './const.js';
import {
  createDeleteAssignments,
  createUpdateAssignments,
  groupByAssignments,
} from './courses/import/assignments.js';
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
  createDeleteLabs,
  createUpdateLabs,
  groupByLab,
} from './labs/import/index.js';
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
import { createIndexContent } from './search.js';
import {
  createDeleteTutorials,
  createUpdateTutorials,
  groupByTutorial,
} from './tutorials/import/index.js';

export const timeLog = (len: number, name: string) => {
  const key = `-- Sync: Syncing ${len} ${name}${len > 1 ? 's' : ''}`;
  console.log(`${key}...`);
  console.time(key);

  return () => {
    console.timeEnd(key);
  };
};

interface SyncResult {
  errors: string[];
  warnings: string[];
}

/**
 * Updates the database from the content files
 */
export const createProcessContentFiles = (dependencies: Dependencies) => {
  const deleteProofreadings = createDeleteProofreadings(dependencies);
  const updateLabs = createUpdateLabs(dependencies);
  const updateResources = createUpdateResources(dependencies);
  const updateCourses = createUpdateCourses(dependencies);
  const updateAssignments = createUpdateAssignments(dependencies);
  const updateTutorials = createUpdateTutorials(dependencies);
  const updateQuizQuestions = createUpdateQuizQuestions(dependencies);
  const updateProfessors = createUpdateProfessors(dependencies);
  const updateEvents = createUpdateEvents(dependencies);
  const updateBCerts = createUpdateBCertExams(dependencies);
  const updateBlogs = createUpdateBlogs(dependencies);
  const updateLegals = createUpdateLegals(dependencies);
  const indexContent = createIndexContent(dependencies);

  return async (
    files: ChangedFile[],
    assets: ChangedAsset[],
  ): Promise<SyncResult> => {
    const filteredFiles = files.filter((file) =>
      supportedContentTypes.some((value) => file.path.startsWith(value)),
    );
    const filteredAssets = assets.filter((asset) =>
      supportedContentTypes.some((value) => asset.path.startsWith(value)),
    );

    const errors: string[] = [];
    const warnings: string[] = [];
    console.log('-- Sync: Deleting proofreadings');
    await deleteProofreadings(errors);

    // Sync professors
    {
      const professors = groupByProfessor(filteredFiles, errors);
      const time = timeLog(professors.length, 'professor');
      for (const professor of professors) {
        await updateProfessors(professor, errors);
      }
      time();
    }

    // Sync labs
    {
      const labs = groupByLab(filteredFiles, errors);
      const time = timeLog(labs.length, 'Plan B Labs');
      for (const lab of labs) {
        await updateLabs(lab, errors);
      }
      time();
    }

    // Sync resources
    {
      const resources = groupByResource(filteredFiles, errors);
      const time = timeLog(resources.length, 'resource');
      for (const resource of resources) {
        await updateResources(resource, errors);
      }
      time();
    }

    // Sync courses
    {
      const courses = groupByCourse(filteredFiles, errors);
      const coursesAssets = groupByCourse(filteredAssets, errors);
      const time = timeLog(courses.length, 'course');

      for (const course of courses) {
        const courseAsset = coursesAssets.find((c) => c.index === course.index);
        await updateCourses(course, courseAsset, errors);
      }

      time();
    }

    // Sync Assignments
    {
      const assignments = groupByAssignments(filteredFiles, errors);
      const time = timeLog(assignments.length, 'assignments');
      for (const assignment of assignments) {
        await updateAssignments(assignment, errors);
      }
      time();
    }

    // Sync legals
    {
      const legals = groupByLegal(filteredFiles, errors);
      const time = timeLog(legals.length, 'legal');
      for (const legal of legals) {
        await updateLegals(legal, errors);
      }
      time();
    }

    // Sync tutorials
    {
      const tutorials = groupByTutorial(filteredFiles, filteredAssets, errors);
      const time = timeLog(tutorials.length, 'tutorial');
      for (const tutorial of tutorials) {
        await updateTutorials(tutorial, errors);
      }
      time();
    }

    // Sync blogs
    {
      const blogs = groupByBlog(filteredFiles, errors);
      const time = timeLog(blogs.length, 'blog');
      for (const blog of blogs) {
        await updateBlogs(blog, errors);
      }
      time();
    }

    // Sync quiz questions
    {
      const quizQuestions = groupByQuizQuestion(filteredFiles, errors);
      const time = timeLog(quizQuestions.length, 'quiz question');
      for (const quizQuestion of quizQuestions) {
        await updateQuizQuestions(quizQuestion, errors);
      }
      time();
    }

    // Sync events
    {
      const events = groupByEvent(filteredFiles, errors);
      const time = timeLog(events.length, 'event');
      for (const event of events) {
        await updateEvents(event, errors);
      }
      time();
    }

    // Sync B Certificates exams
    {
      const bCerts = groupByBCertExam(filteredFiles, errors);
      const time = timeLog(bCerts.length, 'B Certificate exam');
      for (const bCert of bCerts) {
        await updateBCerts(bCert, errors);
      }
      time();
    }

    // Index content
    console.log('-- Sync procedure: indexing content');
    await indexContent(errors);

    return { errors, warnings };
  };
};

export const createProcessDeleteOldEntities = (dependencies: Dependencies) => {
  const deleteLabs = createDeleteLabs(dependencies);
  const deleteProfessors = createDeleteProfessors(dependencies);
  const deleteCourses = createDeleteCourses(dependencies);
  const deleteTutorials = createDeleteTutorials(dependencies);
  const deleteResources = createDeleteResources(dependencies);
  const deleteEvents = createDeleteEvents(dependencies);
  const deleteBCerts = createDeleteBCertExams(dependencies);
  const deleteBlogs = createDeleteBlogs(dependencies);
  const deleteLegals = createDeleteLegals(dependencies);
  const deleteAssignments = createDeleteAssignments(dependencies);

  return async (sync_date: number, errors: string[]) => {
    const timeKey = '-- Sync: Removing old entities';
    console.log(`${timeKey}...`);
    console.time(timeKey);

    await deleteLabs(sync_date, errors);
    await deleteProfessors(sync_date, errors);
    await deleteCourses(sync_date, errors);
    await deleteTutorials(sync_date, errors);
    await deleteResources(sync_date, errors);
    await deleteEvents(sync_date, errors);
    await deleteBCerts(sync_date, errors);
    await deleteBlogs(sync_date, errors);
    await deleteLegals(sync_date, errors);
    await deleteAssignments(sync_date, errors);

    console.timeEnd(timeKey);
  };
};

export const createProcessDisableOldEntities = (dependencies: Dependencies) => {
  const disableQuizQuestions = createDisableQuizQuestions(dependencies);

  return async (sync_date: number, errors: string[]) => {
    const timeKey = '-- Sync: Disabling old entities';
    console.log(`${timeKey}...`);
    console.time(timeKey);

    await disableQuizQuestions(sync_date, errors);

    console.timeEnd(timeKey);
  };
};
