import type { ChangedFile } from '@sovereign-academy/types';

import { supportedContentTypes } from './const';
import { createProcessChangedCourse, groupByCourse } from './courses';
import type { Dependencies } from './dependencies';
import { createProcessChangedResource, groupByResource } from './resources';
import { createProcessChangedTutorial, groupByTutorial } from './tutorials';

export { computeAssetRawUrl } from './utils';
export { ResourceCategory } from './resources/const';

export const createProcessChangedFiles =
  (dependencies: Dependencies) =>
  async (content: ChangedFile[], baseUrl: string) => {
    const filteredFiles = content.filter((file) =>
      supportedContentTypes.some((value) => file.path.startsWith(value))
    );

    const processChangedResource = createProcessChangedResource(dependencies);
    const processChangedCourse = createProcessChangedCourse(dependencies);
    const processChangedTutorial = createProcessChangedTutorial(dependencies);

    /*
     * Resources
     */
    const resources = groupByResource(filteredFiles, baseUrl);
    for (const resource of resources) {
      await processChangedResource(resource);
    }

    /*
     * Courses
     */
    const courses = groupByCourse(filteredFiles, baseUrl);
    for (const course of courses) {
      await processChangedCourse(course);
    }

    /*
     * Tutorials
     */
    const tutorials = groupByTutorial(filteredFiles, baseUrl);
    for (const tutorial of tutorials) {
      // TODO: Uncomment when we have tutorials
      // await processChangedTutorial(tutorial);
    }
  };
