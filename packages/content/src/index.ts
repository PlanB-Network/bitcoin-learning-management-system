import type { ChangedFile } from '@sovereign-academy/types';

import { createProcessChangedCourse, groupByCourse } from './courses';
import type { Dependencies } from './dependencies';
import { createProcessChangedResource, groupByResource } from './resources';

export { computeAssetRawUrl } from './utils';

export const createProcessChangedFiles =
  (dependencies: Dependencies) =>
  async (content: ChangedFile[], baseUrl: string) => {
    const processChangedResource = createProcessChangedResource(dependencies);
    const processChangedCourse = createProcessChangedCourse(dependencies);

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
  };
