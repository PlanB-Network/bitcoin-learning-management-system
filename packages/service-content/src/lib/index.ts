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
import { pMap } from './utils/concurrency.js';

interface SyncResult {
  errors: string[];
  warnings: string[];
}

/**
 * Updates the database from the content files
 */
export const createProcessContentFiles = (
  dependencies: Pick<Dependencies, 'postgres' | 's3' | 'typesense'>,
) => {
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

    const CONCURRENCY = 10;

    const errors: string[] = [];
    const warnings: string[] = [];
    console.log('[sync] Deleting proofreadings');
    await deleteProofreadings(errors);

    // Group all content types (CPU-only, fast)
    const professors = groupByProfessor(filteredFiles, errors);
    const labs = groupByLab(filteredFiles, errors);
    const resources = groupByResource(filteredFiles, errors);
    const events = groupByEvent(filteredFiles, errors);
    const courses = groupByCourse(filteredFiles, errors);
    const coursesAssets = groupByCourse(filteredAssets, errors);
    const assignments = groupByAssignments(filteredFiles, errors);
    const legals = groupByLegal(filteredFiles, errors);
    const tutorials = groupByTutorial(filteredFiles, filteredAssets, errors);
    const blogs = groupByBlog(filteredFiles, errors);
    const quizQuestions = groupByQuizQuestion(filteredFiles, errors);
    const bCerts = groupByBCertExam(filteredFiles, errors);

    // Phase 1: Independent types (no FK dependencies)
    console.time('[sync] Phase 1: Independent types');
    console.log(
      `[sync] Phase 1: professors(${professors.length}), labs(${labs.length}), resources(${resources.length}), events(${events.length}), blogs(${blogs.length}), legals(${legals.length}), bcerts(${bCerts.length})`,
    );
    await Promise.all([
      pMap(professors, (p) => updateProfessors(p, errors), CONCURRENCY),
      pMap(labs, (l) => updateLabs(l, errors), CONCURRENCY),
      pMap(resources, (r) => updateResources(r, errors), CONCURRENCY),
      pMap(events, (e) => updateEvents(e, errors), CONCURRENCY),
      pMap(blogs, (b) => updateBlogs(b, errors), CONCURRENCY),
      pMap(legals, (l) => updateLegals(l, errors), CONCURRENCY),
      pMap(bCerts, (b) => updateBCerts(b, errors), CONCURRENCY),
    ]);
    console.timeEnd('[sync] Phase 1: Independent types');

    // Phase 2: Depends on professors
    console.time('[sync] Phase 2: Courses & tutorials');
    console.log(
      `[sync] Phase 2: courses(${courses.length}), tutorials(${tutorials.length})`,
    );
    await Promise.all([
      pMap(
        courses,
        (course) => {
          const courseAsset = coursesAssets.find(
            (c) => c.index === course.index,
          );
          return updateCourses(course, courseAsset, errors);
        },
        CONCURRENCY,
      ),
      pMap(tutorials, (t) => updateTutorials(t, errors), CONCURRENCY),
    ]);
    console.timeEnd('[sync] Phase 2: Courses & tutorials');

    // Phase 3: Depends on courses
    console.time('[sync] Phase 3: Quiz questions & assignments');
    console.log(
      `[sync] Phase 3: quizQuestions(${quizQuestions.length}), assignments(${assignments.length})`,
    );
    await Promise.all([
      pMap(quizQuestions, (q) => updateQuizQuestions(q, errors), CONCURRENCY),
      pMap(assignments, (a) => updateAssignments(a, errors), CONCURRENCY),
    ]);
    console.timeEnd('[sync] Phase 3: Quiz questions & assignments');

    // Index content
    console.log('[sync] Indexing search content (Typesense)');
    await indexContent(errors);

    return { errors, warnings };
  };
};

export const createProcessDeleteOldEntities = (
  dependencies: Pick<Dependencies, 'postgres'>,
) => {
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
    const timeKey = '[sync] Removing old entities';
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

export const createProcessDisableOldEntities = (
  dependencies: Pick<Dependencies, 'postgres'>,
) => {
  const disableQuizQuestions = createDisableQuizQuestions(dependencies);

  return async (sync_date: number, errors: string[]) => {
    const timeKey = '[sync] Disabling old entities';
    console.log(`${timeKey}...`);
    console.time(timeKey);

    await disableQuizQuestions(sync_date, errors);

    console.timeEnd(timeKey);
  };
};
