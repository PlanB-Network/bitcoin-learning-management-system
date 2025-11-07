import { sql } from '@blms/database';
import type { JoinedVideo } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';

export const createGetVideos = ({ postgres }: Dependencies) => {
  return async (id: string, language?: string): Promise<JoinedVideo[]> => {
    const video = await postgres.exec(getVideosQuery(id, language));

    if (!video) {
      throw new Error('Video not found');
    }

    return video;
  };
};

export const getVideosQuery = (id: string, language?: string) => {
  return sql<JoinedVideo[]>`
    SELECT
      v.id,
      v.course_id,
      vl.language,
      vl.provider,
      vl.id_from_provider,
      CASE
        WHEN vl.language = c.original_language THEN 'original'
        ELSE 'AI'
      END AS source_type
    FROM content.videos v
    JOIN content.videos_localized vl ON v.id = vl.id
    JOIN content.courses c ON c.id = v.course_id
    WHERE v.id = ${id}
      ${
        language
          ? sql` AND (
        (
          EXISTS(SELECT 1 FROM content.videos_localized vl2 WHERE vl2.id = v.id AND vl2.language = LOWER(${language})) AND
          (vl.language = LOWER(${language}) OR vl.language = c.original_language)
        ) OR (
          NOT EXISTS(SELECT 1 FROM content.videos_localized vl2 WHERE vl2.id = v.id AND vl2.language = LOWER(${language})) AND
          vl.language = 'en'
        )
      )`
          : sql``
      }
    ORDER BY
      CASE
        WHEN vl.language = c.original_language THEN 2
        ELSE 1
      END,
      vl.provider DESC
  `;
};
