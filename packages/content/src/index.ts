import type { ChangedFile } from '@sovereign-academy/types';

import { supportedContentTypes } from './const';
import { createProcessChangedCourse, groupByCourse } from './courses';
import type { Dependencies } from './dependencies';
import { createProcessChangedResource, groupByResource } from './resources';
import { createProcessChangedTutorial, groupByTutorial } from './tutorials';

export { computeAssetCdnUrl } from './utils';
export { ResourceCategory } from './resources/const';

export const createProcessChangedFiles =
  (dependencies: Dependencies) => async (files: ChangedFile[]) => {
    const filteredFiles = files.filter((file) =>
      supportedContentTypes.some((value) => file.path.startsWith(value))
    );

    const processChangedResource = createProcessChangedResource(dependencies);
    const processChangedCourse = createProcessChangedCourse(dependencies);
    const processChangedTutorial = createProcessChangedTutorial(dependencies);

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
      // TODO: Uncomment when we have tutorials
      // await processChangedTutorial(tutorial);
    }
  };
