import { JoinedTutorial } from '@sovereign-academy/types';

import { sql } from '../../index';

export const getTutorialsQuery = (category?: string, language?: string) => {
  return sql<JoinedTutorial[]>`
    WITH tutorials AS (
      SELECT 
        t.id, t.path, tl.language, t.level, t.category, t.subcategory, t.builder, tl.name, 
        tl.description, t.last_updated, t.last_commit, ARRAY_AGG(tg.name) AS tags
      FROM content.tutorials t
      JOIN content.tutorials_localized tl ON t.id = tl.tutorial_id
      LEFT JOIN content.tutorial_tags tt ON tt.tutorial_id = t.id
      LEFT JOIN content.tags tg ON tg.id = tt.tag_id
      ${category ? sql`WHERE t.category = ${category}` : sql``}
      ${
        language
          ? category
            ? sql`AND tl.language = ${language}`
            : sql`WHERE tl.language = ${language}`
          : sql``
      }
      GROUP BY t.id, tl.language, t.level, t.category, t.subcategory, t.builder, tl.name,
      tl.description, t.last_updated, t.last_commit
    )
    SELECT tutorials.*, row_to_json(builders) AS builder FROM tutorials
    LEFT JOIN (
      SELECT 
        r.id, r.path, bl.language, b.name, b.category, b.website_url, b.twitter_url, 
        b.github_url, b.nostr, bl.description, r.last_updated, r.last_commit
      FROM content.builders b
      JOIN content.resources r ON r.id = b.resource_id
      JOIN content.builders_localized bl ON bl.builder_id = b.resource_id
    ) builders ON builders.name = tutorials.builder AND builders.language = tutorials.language
  `;
};

export const getTutorialQuery = (id: number, language?: string) => {
  return sql<JoinedTutorial[]>`
    WITH tutorial AS (
      SELECT 
        t.id, t.path, tl.language, t.level, t.category, t.subcategory, t.builder, tl.name, 
        tl.description, tl.raw_content, t.last_updated, t.last_commit, ARRAY_AGG(tg.name) AS tags
      FROM content.tutorials t
      JOIN content.tutorials_localized tl ON t.id = tl.tutorial_id
      LEFT JOIN content.tutorial_tags tt ON tt.tutorial_id = t.id
      LEFT JOIN content.tags tg ON tg.id = tt.tag_id
      WHERE t.id = ${id} 
      ${language ? sql`AND tl.language = ${language}` : sql``}
      GROUP BY t.id, tl.language, t.level, t.category, t.subcategory, t.builder, tl.name,
      tl.description, tl.raw_content, t.last_updated, t.last_commit
    )
    SELECT tutorial.*, row_to_json(builders) AS builder FROM tutorial
    LEFT JOIN (
      SELECT
        r.id, r.path, bl.language, b.name, b.category, b.website_url, b.twitter_url,
        b.github_url, b.nostr, bl.description, r.last_updated, r.last_commit
      FROM content.builders b
      JOIN content.resources r ON r.id = b.resource_id
      JOIN content.builders_localized bl ON bl.builder_id = b.resource_id
    ) builders ON builders.name = tutorial.builder AND builders.language = tutorial.language
  `;
};
