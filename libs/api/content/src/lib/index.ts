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

    const processChangedResource = createProcessChangedResource(dependencies);
    const processChangedCourse = createProcessChangedCourse(dependencies);
    const processChangedTutorial = createProcessChangedTutorial(dependencies);
    const processChangedQuizQuestion =
      createProcessChangedQuizQuestion(dependencies);
    const processChangedProfessor = createProcessChangedProfessor(dependencies);

    /*
     * Resources
     */
    const resources = groupByResource(filteredFiles);
    for (const resource of resources) {
      await processChangedResource(resource);
    }

    /*
     * Courses
     */
    const courses = groupByCourse(filteredFiles);
    for (const course of courses) {
      await processChangedCourse(course);
    }

    /*
     * Tutorials
     */
    const tutorials = groupByTutorial(filteredFiles);
    for (const tutorial of tutorials) {
      await processChangedTutorial(tutorial);
    }

    /**
     * Quizzes
     */
    const quizQuestions = groupByQuizQuestion(filteredFiles);
    for (const quizQuestion of quizQuestions) {
      await processChangedQuizQuestion(quizQuestion);
    }

    /**
     * Professors
     */
    const professors = groupByProfessor(filteredFiles);
    for (const professor of professors) {
      await processChangedProfessor(professor);
    }
  };
