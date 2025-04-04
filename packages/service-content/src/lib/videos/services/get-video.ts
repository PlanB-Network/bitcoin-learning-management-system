import { firstRow, sql } from '@blms/database';
import type { JoinedVideo } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';

export const createGetVideo = ({ postgres }: Dependencies) => {
  return async (id: string, language?: string): Promise<JoinedVideo> => {
    const video = await postgres
      .exec(getVideoQuery(id, language))
      .then(firstRow);

    if (!video) {
      throw new Error('Video not found');
    }

    return video;
  };
};

export const getVideoQuery = (id: string, language?: string) => {
  return sql<JoinedVideo[]>`
    SELECT DISTINCT ON (v.id)
      v.id,
      v.course_id,
      vl.language,
      vl.provider,
      vl.id_from_provider
    FROM content.videos v
    JOIN content.videos_localized vl ON v.id = vl.id
    WHERE v.id = ${id}
    ${language ? sql`AND (vl.language = LOWER(${language}) OR vl.language = 'en')` : sql``}
    ORDER BY
      v.id,
      CASE
        WHEN ${language ? sql`vl.language = LOWER(${language})` : sql`false`} THEN 1
        ELSE 2
      END
  `;
};
