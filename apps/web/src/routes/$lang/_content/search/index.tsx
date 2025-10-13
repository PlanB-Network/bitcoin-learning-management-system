import { Button, CategorySwitcher, cn, EmptyState, Loader } from '@blms/ui';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbChevronsDown, TbLicenseOff } from 'react-icons/tb';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { FilterDropdown } from '#src/patterns/filter-dropdown.tsx';
import { cdnUrl } from '#src/utils/index.ts';
import { useDebounce } from '#src/utils/search.ts';
import { toCamelCase } from '#src/utils/string.ts';
import { toggleSelection } from '#src/utils/toggle.ts';
import { trpc } from '#src/utils/trpc.ts';
import { SearchResult } from './-components/search-result.tsx';

export const Route = createFileRoute('/$lang/_content/search/')({
  component: SearchPage,
});

const GlossaryMarkdownBody = lazy(
  () => import('#src/components/Markdown/glossary-markdown-body.tsx'),
);

function SearchPage() {
  const { t, i18n } = useTranslation();

  const [categories, setCategories] = useState<Set<string>>(new Set(['all']));

  const isMobile = useSmaller('md');

  const availableCategories = [
    // Main categories
    'courses',
    'events',
    'tutorials',
    'professors',
    // Resources
    'books',
    'newsletters',
    'podcasts',
    'projects',
    'youtube_channels',
    'conference_replays',
    'glossary_words',
    'lecture_replays',
  ];

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);
  const search = useInfiniteQuery(
    trpc.content.search.infiniteQueryOptions(
      {
        categories: [
          ...(categories.has('all') ? availableCategories : categories),
        ],
        language: i18n.language,
        limit: 20,
        query: debouncedQuery,
        surroundingWords: isMobile ? 15 : 20,
      },
      {
        enabled: debouncedQuery.length > 0,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialCursor: 1, // Only fetch when query has input
      },
    ),
  );

  const { data: glossaryWords } = useQuery(
    trpc.content.getGlossaryWords.queryOptions({
      language: i18n.language ?? 'en',
    }),
  );

  // Get glossary word if exact match from query
  const glossaryWord = glossaryWords?.find(
    (word) => word.term.toLowerCase() === query.toLowerCase(),
  );

  const lastPage = search.data?.pages[search.data.pages.length - 1];

  const clearSearch = () => {
    setQuery('');
    setCategories(new Set(['all']));
  };

  const handleFilterChange = (_category: string, option: string) => {
    toggleSelection(option, categories, setCategories);
  };

  return (
    <PageLayout title={t('search.explorer.title')} layoutSize="base">
      <FilterDropdown
        searchQuery={query}
        setSearchQuery={setQuery}
        onClear={clearSearch}
        onChange={handleFilterChange}
        filters={{
          Categories: availableCategories.map((category) => ({
            name: category,
            translation:
              category !== 'all'
                ? t(`search.${toCamelCase(category)}`)
                : t('search.all'),
          })),
        }}
        selectedFilters={{ Categories: categories }}
      />

      {Object.entries({
        Categories: availableCategories,
      }).map(([_groupname, group], index) => {
        const target = {
          dispatch: setCategories,
          value: categories,
        };

        return (
          <div
            className="flex flex-col gap-2 max-md:hidden mt-8"
            // biome-ignore lint/suspicious/noArrayIndexKey: explanation
            key={`group-${index}`}
          >
            <span className="label-strong">{t('words.filter')}</span>
            <div className="flex flex-wrap gap-2">
              <CategorySwitcher
                // biome-ignore lint/suspicious/noArrayIndexKey: explanation
                key={`group-${index}-all`}
                size="m"
                onClick={() =>
                  toggleSelection('all', target.value, target.dispatch)
                }
                isActive={target.value.has('all')}
                text={t('search.all')}
              />

              {group.map((category) => (
                <CategorySwitcher
                  key={`group-${index}-${category}`}
                  size="m"
                  onClick={() =>
                    toggleSelection(category, target.value, target.dispatch)
                  }
                  isActive={target.value.has(category)}
                  text={t(`search.${toCamelCase(category)}`)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {query.length === 0 && (
        <div>
          <p className="text-center body-extra-small md:body-base text-neutral-400 mt-3 md:mt-6">
            {t('search.startSearch')}
          </p>
        </div>
      )}

      {query.length > 0 && glossaryWord && (
        <div className="my-3 md:my-6">
          <h2 className="w-full title-base md:title-large mb-3 md:mb-6">
            {glossaryWord?.term}
          </h2>
          <Suspense fallback={<Loader size={'s'} />}>
            <GlossaryMarkdownBody
              content={glossaryWord?.definition || ''}
              assetPrefix={cdnUrl(glossaryWord?.path || '')}
            />
          </Suspense>
        </div>
      )}

      <div>
        {search.isLoading && (
          <div className="mt-6 h-screen">
            <Loader size={'s'} />
          </div>
        )}
        {search.isError && (
          <p className="body-base mt-6">{t('search.resultError')}</p>
        )}
        {lastPage && (
          <div className="flex flex-col gap-3 md:gap-6">
            <div
              className={cn(
                'mb-2 mt-6 text-center max-md:hidden',
                lastPage.results.length === 0 && categories.has('all')
                  ? 'hidden'
                  : '',
              )}
            >
              {lastPage.found > 0 && (
                <p className="text-neutral-400 font-light text-sm">
                  {t('search.resultsFound', {
                    count: lastPage.found,
                  })}
                </p>
              )}
            </div>
            <ul className="flex flex-col gap-3 md:gap-1">
              {search.data?.pages
                .flatMap((page) => page.results)
                .map((item, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: react complains otherwise
                  <li key={index} className="mt-2">
                    <SearchResult item={item} index={index} />
                  </li>
                ))}
            </ul>
            {lastPage && search.data?.pages?.[0].found === 0 && (
              <EmptyState
                title={t('search.noResults')}
                description={t('search.resultEmpty')}
                icon={TbLicenseOff}
              />
            )}
            {lastPage.remaining > 0 && (
              <div className="flex flex-col justify-center items-center gap-2 mt-3 md:mt-6 w-full">
                <Button
                  onClick={() => search.fetchNextPage()}
                  disabled={search.isFetchingNextPage}
                  variant="newTertiary"
                  className="w-full flex items-center gap-4"
                >
                  {t('search.loadMoreResults')}
                  <TbChevronsDown size-={16} className="shrink-0" />
                </Button>

                <span className="text-neutral-400 body-extra-small">
                  {t('search.resultsRemaining', {
                    count: lastPage.remaining,
                  })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
