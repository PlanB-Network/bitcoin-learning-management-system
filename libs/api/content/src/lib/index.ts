import type { ChangedFile } from '@sovereign-university/types';

import { supportedContentTypes } from './const';
import { createProcessChangedCourse, groupByCourse } from './courses/import';
import type { Dependencies } from './dependencies';
import {
  createProcessChangedProfessor,
  groupByProfessor,
} from './professors/import';
import {
  createProcessChangedQuizQuestion,
  groupByQuizQuestion,
} from './quizzes/questions/import';
import {
  createProcessChangedResource,
  groupByResource,
} from './resources/import';
import {
  createProcessChangedTutorial,
  groupByTutorial,
} from './tutorials/import';

export const createProcessChangedFiles =
  (dependencies: Dependencies) => async (files: ChangedFile[]) => {
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
    const resources = groupByResource(filteredFiles);
    for (const resource of resources) {
      await processChangedResource(resource);
    }

    console.log('-- Sync procedure: Syncing courses');
    const courses = groupByCourse(filteredFiles);
    for (const course of courses) {
      await processChangedCourse(course);
    }

    console.log('-- Sync procedure: Syncing tutorials');
    const tutorials = groupByTutorial(filteredFiles);
    for (const tutorial of tutorials) {
      await processChangedTutorial(tutorial);
    }

    console.log('-- Sync procedure: Syncing quizQuestions');
    const quizQuestions = groupByQuizQuestion(filteredFiles);
    for (const quizQuestion of quizQuestions) {
      await processChangedQuizQuestion(quizQuestion);
    }

    console.log('-- Sync procedure: Syncing professors');
    const professors = groupByProfessor(filteredFiles);
    for (const professor of professors) {
      await processChangedProfessor(professor);
    }

    if (errors.length > 0) {
      console.error(
        `=== ${errors.length} ERRORS occured during the sync process : `,
      );
      console.error(errors);
    }
  };
