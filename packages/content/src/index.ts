import type { ChangedFile } from '@sovereign-academy/types';

import { createProcessChangedCourse, groupByCourse } from './courses';
import type { Dependencies } from './dependencies';
import { createProcessChangedResource, groupByResource } from './resources';
import { createProcessChangedTutorial, groupByTutorial } from './tutorials';

export { computeAssetRawUrl } from './utils';

export const createProcessChangedFiles =
  (dependencies: Dependencies) =>
  async (content: ChangedFile[], baseUrl: string) => {
    const processChangedResource = createProcessChangedResource(dependencies);
    const processChangedCourse = createProcessChangedCourse(dependencies);
    const processChangedTutorial = createProcessChangedTutorial(dependencies);

    /*
     * Resources
     */
    const resources = groupByResource(content, baseUrl);
    for (const resource of resources) {
      // console.log(resource);
      await processChangedResource(resource);
    }

    /*
     * Courses
     */
    const courses = groupByCourse(content, baseUrl);
    for (const course of courses) {
      await processChangedCourse(course);
    }

    /*
     * Tutorials
     */
    const tutorials = groupByTutorial(content, baseUrl);
    for (const tutorial of tutorials) {
      await processChangedTutorial(tutorial);
    }
  };
