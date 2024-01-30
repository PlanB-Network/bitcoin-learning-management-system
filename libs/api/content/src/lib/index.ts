import type { ChangedFile } from '@sovereign-university/types';

import { supportedContentTypes } from './const';
import {
  createProcessChangedCourse,
  createProcessDeleteCourses,
  groupByCourse,
} from './courses/import';
import type { Dependencies } from './dependencies';
import {
  createProcessChangedProfessor,
  createProcessDeleteProfessors as createProcessDeleteProfessors,
  groupByProfessor,
} from './professors/import';
import {
  createProcessChangedQuizQuestion,
  createProcessDeleteQuizQuestions,
  groupByQuizQuestion,
} from './quizzes/questions/import';
import {
  createProcessChangedResource,
  createProcessDeleteResources,
  groupByResource,
} from './resources/import';
import {
  createProcessChangedTutorial,
  createProcessDeleteTutorials,
  groupByTutorial,
} from './tutorials/import';

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

    console.log('-- Sync procedure: Syncing resources');
    const resources = groupByResource(filteredFiles, errors);
    for (const resource of resources) {
      await processChangedResource(resource);
    }

    console.log('-- Sync procedure: Syncing courses');
    const courses = groupByCourse(filteredFiles, errors);
    for (const course of courses) {
      await processChangedCourse(course);
    }

    console.log('-- Sync procedure: Syncing tutorials');
    const tutorials = groupByTutorial(filteredFiles, errors);
    for (const tutorial of tutorials) {
      await processChangedTutorial(tutorial);
    }

    console.log('-- Sync procedure: Syncing quizQuestions');
    const quizQuestions = groupByQuizQuestion(filteredFiles, errors);
    for (const quizQuestion of quizQuestions) {
      await processChangedQuizQuestion(quizQuestion);
    }

    console.log('-- Sync procedure: Syncing professors');
    const professors = groupByProfessor(filteredFiles, errors);
    for (const professor of professors) {
      await processChangedProfessor(professor);
    }

    return errors;
  };

export const createProcessDeleteOldEntities =
  (dependencies: Dependencies) =>
  async (sync_date: number, errors: string[]) => {
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
