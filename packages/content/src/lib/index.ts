import type { ChangedFile } from '@sovereign-university/types';

import { supportedContentTypes } from './const.js';
import {
  createProcessChangedCourse,
  createProcessDeleteCourses,
  groupByCourse,
} from './courses/import/index.js';
import type { Dependencies } from './dependencies.js';
import {
  createProcessChangedEvent,
  groupByEvent,
} from './events/import/index.js';
import {
  createProcessChangedProfessor,
  createProcessDeleteProfessors as createProcessDeleteProfessors,
  groupByProfessor,
} from './professors/import/index.js';
import {
  createProcessChangedQuizQuestion,
  createProcessDeleteQuizQuestions,
  groupByQuizQuestion,
} from './quizzes/questions/import/index.js';
import {
  createProcessChangedResource,
  createProcessDeleteResources,
  groupByResource,
} from './resources/import/index.js';
import {
  createProcessChangedTutorial,
  createProcessDeleteTutorials,
  groupByTutorial,
} from './tutorials/import/index.js';

export const createProcessChangedFiles =
  (dependencies: Dependencies) =>
  async (files: ChangedFile[]): Promise<string[]> => {
    const filteredFiles = files.filter((file) =>
      supportedContentTypes.some((value) => file.path.startsWith(value)),
    );
    const errors: string[] = [];

    const processChangedResource = createProcessChangedResource(
      dependencies,
      errors,
    );
    const processChangedCourse = createProcessChangedCourse(
      dependencies,
      errors,
    );
    const processChangedTutorial = createProcessChangedTutorial(
      dependencies,
      errors,
    );
    const processChangedQuizQuestion = createProcessChangedQuizQuestion(
      dependencies,
      errors,
    );
    const processChangedProfessor = createProcessChangedProfessor(
      dependencies,
      errors,
    );
    const processChangedEvent = createProcessChangedEvent(dependencies, errors);

    const resources = groupByResource(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${resources.length} resources`);
    for (const resource of resources) {
      await processChangedResource(resource);
    }

    const courses = groupByCourse(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${courses.length} courses`);
    for (const course of courses) {
      await processChangedCourse(course);
    }

    const tutorials = groupByTutorial(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${tutorials.length} tutorials`);
    for (const tutorial of tutorials) {
      await processChangedTutorial(tutorial);
    }

    const quizQuestions = groupByQuizQuestion(filteredFiles, errors);
    console.log(
      `-- Sync procedure: Syncing ${quizQuestions.length} quizQuestions`,
    );
    for (const quizQuestion of quizQuestions) {
      await processChangedQuizQuestion(quizQuestion);
    }

    const professors = groupByProfessor(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${professors.length} professors`);
    for (const professor of professors) {
      await processChangedProfessor(professor);
    }

    const events = groupByEvent(filteredFiles, errors);
    console.log(`-- Sync procedure: Syncing ${events.length} events`);
    for (const event of events) {
      await processChangedEvent(event);
    }

    return errors;
  };

export const createProcessDeleteOldEntities =
  (dependencies: Dependencies) =>
  async (sync_date: number, errors: string[]) => {
    console.log('-- Sync procedure: Remove old entities');
    const processDeleteProfessors = createProcessDeleteProfessors(
      dependencies,
      errors,
    );
    const processDeleteCourses = createProcessDeleteCourses(
      dependencies,
      errors,
    );
    const processDeleteQuizQuestions = createProcessDeleteQuizQuestions(
      dependencies,
      errors,
    );
    const processDeleteTutorials = createProcessDeleteTutorials(
      dependencies,
      errors,
    );
    const processDeleteResources = createProcessDeleteResources(
      dependencies,
      errors,
    );

    await processDeleteProfessors(sync_date);
    await processDeleteCourses(sync_date);
    await processDeleteQuizQuestions(sync_date);
    await processDeleteTutorials(sync_date);
    await processDeleteResources(sync_date);
  };
