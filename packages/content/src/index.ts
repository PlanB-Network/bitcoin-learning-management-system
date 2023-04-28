import type { ChangedAsset, ChangedFile } from '@sovereign-academy/types';

import type { Dependencies } from './dependencies';
import {
  createProcessChangedResource,
  createProcessTagsFile,
  groupByResource,
  filterOutTagsFile,
} from './parser';

export const createProcessChangedFiles =
  (dependencies: Dependencies) =>
  async (content: (ChangedFile | ChangedAsset)[], baseUrl: string) => {
    // Resources
    const processTagsFile = createProcessTagsFile(dependencies);
    const processChangedResource = createProcessChangedResource(dependencies);

    const resources = groupByResource(filterOutTagsFile(content), baseUrl);

    await processTagsFile(content);

    for (const resource of resources) {
      await processChangedResource(resource);
    }
  };
