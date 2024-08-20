import { sql } from '@blms/database';
import type { JoinedBet } from '@blms/types';

export const getBetsQuery = (language?: string) => {
  return sql<JoinedBet[]>`
    WITH prioritized_bets AS (
      SELECT
        b.resource_id,
        bl.language,
        bl.name,
        bl.description,
        ROW_NUMBER() OVER (PARTITION BY b.resource_id ORDER BY CASE WHEN bl.language = ${language || 'en'} THEN 1 WHEN bl.language = 'en' THEN 2 ELSE 3 END) as row_num
      FROM
        content.bet b
      JOIN
        content.bet_localized bl
        ON bl.bet_id = b.resource_id
      WHERE
        ${language ? sql`bl.language IN (${language}, 'en')` : sql`bl.language = 'en'`}
    )
    SELECT 
      r.id, 
      r.path, 
      pb.language, 
      pb.name, 
      pb.description, 
      b.download_url, 
      b.original_language,
      b.type, 
      b.builder, 
      r.last_updated, 
      r.last_commit, 
      json_agg(json_build_object(
        'betId', bvu.bet_id,
        'language', bvu.language, 
        'viewUrl', bvu.view_url
      )) AS viewurls,
      COALESCE((SELECT ARRAY_AGG(DISTINCT t.name)
        FROM content.resource_tags rt
        JOIN content.tags t ON t.id = rt.tag_id
        WHERE rt.resource_id = r.id), ARRAY[]::text[]) AS tags
    FROM 
      content.bet b
    JOIN 
      content.resources r 
      ON r.id = b.resource_id
    JOIN 
      prioritized_bets pb 
      ON pb.resource_id = b.resource_id AND pb.row_num = 1
    LEFT JOIN
      content.bet_view_url bvu
      ON bvu.bet_id = b.resource_id
    GROUP BY 
      r.id, 
      r.path, 
      pb.language, 
      pb.name, 
      pb.description, 
      b.download_url,
      b.original_language,
      b.type, 
      b.builder, 
      r.last_updated, 
      r.last_commit
  `;
};
