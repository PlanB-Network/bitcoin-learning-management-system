import { sql } from '@sovereign-university/database';
import type { JoinedConference } from '@sovereign-university/types';

export const getConferenceQuery = (resourceId: number) => {
  return sql<JoinedConference[]>`
    SELECT 
      r.id, r.path, c.name, c.description, c.year, c.builder, c.languages, c.location, 
      c.website_url, c.twitter_url, r.last_updated, r.last_commit,
      json_agg(json_build_object(
        'stageId', cs.stage_id, 
        'stageName', cs.name, 
        'videos', (
          SELECT json_agg(json_build_object(
            'videoId', csv.video_id,
            'videoName', csv.name,
            'rawContent', csv.raw_content
          ))
          FROM content.conferences_stages_videos csv 
          WHERE csv.stage_id = cs.stage_id
        )
      )) AS stages,
      ARRAY_AGG(t.name) AS tags
    FROM content.conferences c
    JOIN content.resources r ON r.id = c.resource_id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    LEFT JOIN content.conferences_stages cs ON cs.conference_id = c.resource_id
    WHERE c.resource_id = ${resourceId}
    GROUP BY r.id, c.resource_id, c.name, c.description, c.year, c.builder, c.languages, c.location, 
      c.website_url, c.twitter_url
  `;
};
