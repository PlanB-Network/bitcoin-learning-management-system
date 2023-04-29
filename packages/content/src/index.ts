import type { ChangedAsset, ChangedFile } from '@sovereign-academy/types';

import type { Dependencies } from './dependencies';
import {
  createProcessChangedResource,
  groupByResource,
} from './parser';

export const createProcessChangedFiles =
  (dependencies: Dependencies) =>
  async (content: (ChangedFile | ChangedAsset)[], baseUrl: string) => {
    // Resources
    const processChangedResource = createProcessChangedResource(dependencies);

    const resources = groupByResource(content, baseUrl);

    for (const resource of resources) {
      await processChangedResource(resource);
    }
  };
