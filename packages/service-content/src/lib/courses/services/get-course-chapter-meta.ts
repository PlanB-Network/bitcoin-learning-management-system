import { firstRow } from '@blms/database';
import type { Dependencies } from '../../dependencies.js';
import { getCourseChapterMetaQuery } from '../queries/index.js';
import { computeAssetCdnUrl } from '../../utils.js';

export const createGetCourseChapterMeta = (dependencies: Dependencies) => {
  const { postgres } = dependencies;

  // TODO: Add return type
  return async (chapterId: string, language: string) => {
    const chapter = await postgres
      .exec(getCourseChapterMetaQuery(chapterId, language))
      .then(firstRow);

    if (!chapter) throw new Error('Chapter not found');

    return {
      ...chapter,
      thumbnail: computeAssetCdnUrl(
        chapter.lastCommit,
        `courses/${chapter.courseId}`,
        'thumbnail.webp',
      ),
    };
  };
};
