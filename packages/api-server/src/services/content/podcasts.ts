import { computeAssetCdnUrl } from '@sovereign-academy/content';
import { firstRow, getPodcastQuery } from '@sovereign-academy/database';
import { JoinedPodcast } from '@sovereign-academy/types';

import { Dependencies } from '../../dependencies';

export const createGetPodcasts =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const result = await postgres<JoinedPodcast[]>`
      SELECT 
        r.id, r.path, p.language, p.name, p.host, p.description, p.website_url, 
        p.twitter_url, p.podcast_url, p.nostr, r.last_updated, r.last_commit,
        ARRAY_AGG(t.name) AS tags
      FROM content.podcasts p
      JOIN content.resources r ON r.id = p.resource_id
      LEFT JOIN content.resource_tags rt ON rt.resource_id = r.id
      LEFT JOIN content.tags t ON t.id = rt.tag_id
      ${language ? postgres`WHERE p.language = ${language}` : postgres``}
      GROUP BY r.id, p.language, p.name, p.host, p.description, p.website_url,
      p.twitter_url, p.podcast_url, p.nostr
    `;

    return result.map((row) => ({
      ...row,
      logo: computeAssetCdnUrl(
        process.env['CDN_URL'] || 'http://localhost:8080',
        row.last_commit,
        row.path,
        'logo.jpg'
      ),
    }));
  };

export const createGetPodcast =
  (dependencies: Dependencies) => async (id: number, language?: string) => {
    const { postgres } = dependencies;

    const podcast = await postgres
      .exec(getPodcastQuery(id, language))
      .then(firstRow);

    if (podcast) {
      return {
        ...podcast,
        logo: computeAssetCdnUrl(
          process.env['CDN_URL'] || 'http://localhost:8080',
          podcast.last_commit,
          podcast.path,
          'logo.jpg'
        ),
      };
    }

    return;
  };
