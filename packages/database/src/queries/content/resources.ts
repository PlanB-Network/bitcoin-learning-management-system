import {
  JoinedBook,
  JoinedBuilder,
  JoinedPodcast,
} from '@sovereign-academy/types';

import { sql } from '../../index';

export const getBookQuery = (id: number, language?: string) => {
  return sql<JoinedBook[]>`
    SELECT 
      r.id, r.path, bl.language, b.level, bl.title, b.author, bl.translator, 
      bl.description, bl.publisher, bl.publication_year, bl.cover, bl.summary_text, 
      bl.summary_contributor_id, bl.shop_url, bl.download_url, b.website_url,
      bl.original, r.last_updated, r.last_commit, ARRAY_AGG(t.name) AS tags
    FROM content.books b
    JOIN content.resources r ON r.id = b.resource_id
    JOIN content.books_localized bl ON bl.book_id = b.resource_id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    WHERE r.id = ${id}
    ${language ? sql`AND bl.language = ${language}` : sql``}
    GROUP BY r.id, bl.language, b.level, bl.title, b.author, bl.translator, 
    bl.description, bl.publisher, bl.publication_year, bl.cover, bl.summary_text, 
    bl.summary_contributor_id, bl.shop_url, bl.download_url, b.website_url,
    bl.original
  `;
};

export const getBuilderQuery = (id: number, language?: string) => {
  return sql<JoinedBuilder[]>`
    SELECT 
      r.id, r.path, bl.language, b.name, b.category, b.website_url, b.twitter_url, 
      b.github_url, b.nostr, bl.description, r.last_updated, r.last_commit,
      ARRAY_AGG(t.name) AS tags
    FROM content.builders b
    JOIN content.resources r ON r.id = b.resource_id
    JOIN content.builders_localized bl ON bl.builder_id = b.resource_id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    WHERE r.id = ${id}
    ${language ? sql`AND bl.language = ${language}` : sql``}
    GROUP BY r.id, bl.language, b.name, b.category, b.website_url, b.twitter_url,
    b.github_url, b.nostr, bl.description
  `;
};

export const getPodcastQuery = (id: number, language?: string) => {
  return sql<JoinedPodcast[]>`
    SELECT 
      r.id, r.path, p.language, p.name, p.host, p.description, p.website_url, 
      p.twitter_url, p.podcast_url, p.nostr, r.last_updated, r.last_commit,
      ARRAY_AGG(t.name) AS tags
    FROM content.podcasts p
    JOIN content.resources r ON r.id = p.resource_id
    LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
    LEFT JOIN content.tags t ON t.id = rt.tag_id
    WHERE r.id = ${id}
    ${language ? sql`AND p.language = ${language}` : sql``}
    GROUP BY r.id, p.language, p.name, p.host, p.description, p.website_url,
    p.twitter_url, p.podcast_url, p.nostr
  `;
};
