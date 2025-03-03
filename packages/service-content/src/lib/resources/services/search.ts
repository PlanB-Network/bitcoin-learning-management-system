import type { SearchResult } from '@blms/types';

import type { Searchable } from '@blms/types';
import type { Dependencies } from '#src/lib/dependencies.js';

interface SearchInput {
  categories?: string[];
  language: string;
  query: string;

  surroundingWords: number;

  // Pagination
  limit: number;
  cursor: number;
}

const searchCategoryMap: Record<string, string[] | null> = {
  courses: ['course', 'course_part', 'course_chapter'],
  books: ['book'],
  events: ['event'],
  glossary_words: ['glossary_word'],
  podcasts: ['podcast'],
  tutorials: ['tutorial'],
  professors: ['professor'],
  newsletters: ['newsletter'],
  youtube_channels: ['youtube_channel'],
  conference_replays: ['conference', 'conference_replay'],
  lecture_replays: ['lecture_replay'],
  projects: ['project'],
  all: null,
  '': null,
};

const notEmptyNotAll = (value: string) => value && value !== 'all';

const CATEGORIES = Object.keys(searchCategoryMap)
  .reduce(
    (categories, key) => categories.concat(searchCategoryMap[key] ?? []),
    [] as string[],
  )
  .filter(notEmptyNotAll);

const CategoryWeight: Record<string, number> = {
  // Course category
  course: 6,
  course_part: 6,
  course_chapter: 6,
  // Tutorials category
  tutorial: 5,
  // Events category
  event: 4,
  // Projects
  project: 3,
  // Professors
  professor: 2,
  // Everything else with a weight of 1
  default: 1,
};

// https://typesense.org/docs/guide/ranking-and-relevance.html#boosting-burying-sets-of-records
// Weight syntax is: _eval([<expression>]):<asc|desc> where <expression> is a valid Typesense expression
const SORT_RULES = [
  // First sort by weighted category
  `_eval([${[
    // Category - Course
    'course',
    'course_part',
    'course_chapter',
    // Category - Tutorial
    'tutorial',
    // Category - Events
    'event',
    // Resource - Projects
    'project',
    // Category - Professor
    'professor',
    // Other resources
    'book',
    'glossary_word',
    'podcast',
    'newsletter',
    'youtube_channel',
    'conference_replay',
    'lecture_replay',
  ]
    .map(
      (field) =>
        `(type:${field}):${CategoryWeight[field] ?? CategoryWeight.default}`,
    )
    .join(',')}]):desc`,
  // Then sort by text match
  '_text_match:desc',
].join(',');

const getCategories = (categories: string[]): string[] => {
  if (!categories.length) {
    return CATEGORIES;
  }

  return categories;
};

export const createSearch = ({ typesense }: Dependencies) => {
  const searchContent = (search: SearchInput) => {
    const categories = getCategories(
      (search.categories ?? [])
        .map((category) => searchCategoryMap[category])
        .filter((category): category is string[] => !!category)
        .flat()
        .filter(notEmptyNotAll),
    );

    const language = search.language.toLowerCase();

    let filter = `language:${language}`;
    if (categories) {
      const map = categories
        .map((category) =>
          category === 'event'
            ? `type:event && endDate:>${~~(Date.now() / 1000)}`
            : `type:${category}`,
        )
        .filter(Boolean)
        .join(' || ');

      filter += map && ` && (${map})`;
    }

    return typesense.collections<Searchable>('searchable').documents().search({
      q: search.query,
      query_by: 'title,body',
      query_by_weights: '3,1',
      sort_by: SORT_RULES,
      prioritize_exact_match: true,
      highlight_affix_num_tokens: search.surroundingWords,
      search_cutoff_ms: 500, // search for 500ms max
      filter_by: filter,
      limit: search.limit,
      page: search.cursor,
    });
  };

  return async (search: SearchInput): Promise<SearchResult<Searchable>> => {
    const searchResult: SearchResult<Searchable> = {
      remaining: 0,
      nextCursor: 0,
      results: [],
      ...search,
      found: 0,
      time: 0,
    };

    const result = await searchContent(search) //
      .catch((error) => ({ error }));

    if ('error' in result) {
      console.error('Failed to search:', result.error);
      return searchResult;
    }

    const results = result.hits ?? [];
    const remaining =
      result.found - (result.page - 1) * search.limit - results.length;

    searchResult.remaining = remaining;
    searchResult.nextCursor = result.page + 1;
    searchResult.results = results;
    searchResult.found = result.found;
    searchResult.time = result.search_time_ms;

    return searchResult;
  };
};
