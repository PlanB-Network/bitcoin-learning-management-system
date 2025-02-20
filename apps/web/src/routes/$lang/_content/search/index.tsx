import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, cn } from '@blms/ui';

import { PageLayout } from '#src/components/page-layout.tsx';
import { trpc } from '#src/utils/trpc.ts';

import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import SearchErrorIcon from '#src/assets/icons/search-error.svg';

import { FilterDropdown } from '#src/organisms/filter-dropdown.tsx';
import { getLanguageName } from '#src/utils/i18n.ts';
import { useDebounce } from '#src/utils/search.ts';
import { toCamelCase } from '#src/utils/string.ts';
import { toggleSelection } from '#src/utils/toggle.ts';
import { SearchResult } from './-components/search-result.tsx';

export const Route = createFileRoute('/$lang/_content/search/')({
  component: SearchPage,
});

function SearchPage() {
  const { t, i18n } = useTranslation();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [categories, setCategories] = useState<Set<string>>(new Set(['all']));
  const [resources, setResources] = useState<Set<string>>(new Set(['all']));

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);
  const search = trpc.content.search.useInfiniteQuery(
    {
      query: debouncedQuery,
      language: i18n.language,
      categories: [...categories, ...resources],
      limit: 20,
    },
    {
      initialCursor: 1,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: debouncedQuery.length > 0, // Only fetch when query has input
    },
  );

  const lastPage = search.data?.pages[search.data.pages.length - 1];

  const clearSearch = () => {
    setQuery('');
    setCategories(new Set(['all']));
    setResources(new Set(['all']));
  };

  const handleFilterChange = (category: string, option: string) => {
    if (category === 'Categories') {
      toggleSelection(option, categories, setCategories);
    } else if (category === 'Resources') {
      toggleSelection(option, resources, setResources);
    }
  };

  const availableCategories = ['courses', 'events', 'tutorials', 'professors'];

  const availableResources = [
    'books',
    'newsletters',
    'podcasts',
    'youtube_channels',
    'conference_replays',
    'glossary_words',
    'projects',
    'lecture_replays',
  ];

  return (
    <PageLayout
      paddingXClasses="px-0"
      maxWidth="max-w-[3000px]"
      title={t('search.explorer.title')}
      subtitle={' '}
    >
      <div className="max-w-6xl pb-8 text-white sm:mx-auto min-h-80">
        <h2 className="text-orange-500 text-center text-xl mt-16">
          {t('search.explorer.subtitle')}
        </h2>

        <div className="mx-2 sm:mb-16 my-8">
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
              Resources: availableResources.map((resource) => ({
                name: resource,
                translation:
                  resource !== 'all'
                    ? t(`search.${toCamelCase(resource)}`)
                    : t('search.all'),
              })),
            }}
            selectedFilters={{
              Categories: categories,
              Resources: resources,
            }}
          />
        </div>

        {query.length === 0 && (
          <div>
            <p className="text-center text-xl mt-16">
              {t('search.startSearch')}
            </p>
          </div>
        )}

        <div>
          {search.isLoading && <p>Loading...</p>}
          {search.isError && (
            <p className="text-red-500">{t('search.resultError')}</p>
          )}
          {lastPage && (
            <div className="mx-auto max-w-2xl md:mx-8 xl:mx-auto md:max-w-none">
              <div
                className={cn(
                  'mb-4 ps-2',
                  lastPage.results.length === 0 &&
                    categories.has('all') &&
                    resources.has('all')
                    ? 'hidden'
                    : '',
                )}
              >
                <div className="hidden md:flex flex-col space-y-4 text-base mb-4">
                  <div className={cn(query.length > 0 ? '' : 'hidden')}>
                    <Button
                      className="flex justify-start items-center gap-2 -ms-4 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-offset-0 focus-visible:outline-1 focus-visible:outline-newOrange-1"
                      variant="ghost"
                      onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                      <HiOutlineAdjustmentsHorizontal className="size-6 stroke-[1.5]" />

                      <p className={cn(filtersOpen && 'underline')}>
                        {t('search.filterByType')}
                      </p>

                      {filtersOpen ? (
                        <MdKeyboardArrowUp className="size-6" />
                      ) : (
                        <MdKeyboardArrowDown className="size-6" />
                      )}
                    </Button>
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-8 font-medium',
                      filtersOpen ? 'flex' : 'hidden',
                    )}
                  >
                    <div className="flex flex-wrap gap-2">
                      <div className="flex flex-col gap-2">
                        {Object.entries({
                          Categories: availableCategories,
                          Resources: availableResources,
                        }).map(([groupname, group], index) => {
                          const target =
                            groupname === 'Categories'
                              ? {
                                  value: categories,
                                  dispatch: setCategories,
                                }
                              : {
                                  value: resources,
                                  dispatch: setResources,
                                };

                          return (
                            <div
                              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                              key={`group-${index}`}
                              className="flex flex-wrap gap-2"
                            >
                              <Button
                                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                key={`group-${index}-all`}
                                variant={
                                  target.value.has('all')
                                    ? 'primary'
                                    : 'outlineWhite'
                                }
                                size="s"
                                onClick={() =>
                                  toggleSelection(
                                    'all',
                                    target.value,
                                    target.dispatch,
                                  )
                                }
                                className="focus-visible:border-newOrange-1"
                              >
                                {`${t('search.all')}`}
                              </Button>

                              {group.map((category) => {
                                return (
                                  <Button
                                    key={category}
                                    variant={
                                      target.value.has(category)
                                        ? 'primary'
                                        : 'outlineWhite'
                                    }
                                    size="s"
                                    onClick={() => {
                                      toggleSelection(
                                        category,
                                        target.value,
                                        target.dispatch,
                                      );
                                    }}
                                    className="focus-visible:border-newOrange-1"
                                  >
                                    {`${t(`search.${category}`)}`}
                                  </Button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 font-light text-sm mb-6">
                  {t('search.languageSelected', {
                    language: getLanguageName(i18n.language),
                  })}
                </p>
                {lastPage.found > 0 && (
                  <>
                    <p className="mb-1">{t('search.searchResult')}</p>

                    <p className="text-gray-300 font-light text-sm mb-8">
                      {t('search.resultInfo', {
                        count: lastPage.found,
                        time: lastPage.time,
                      })}
                    </p>
                  </>
                )}
              </div>
              <ul className="search-results">
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
                <div className="flex flex-col items-center space-y-8 mt-12 max-w-xl mx-auto text-center">
                  <img src={SearchErrorIcon} alt="search error" />

                  <p>{t('search.resultEmpty')}</p>
                </div>
              )}
              {lastPage.remaining > 0 && (
                <div className="flex flex-col justify-center items-center gap-4 mt-16">
                  <Button
                    onClick={() => search.fetchNextPage()}
                    disabled={search.isFetchingNextPage}
                    variant="tertiary"
                  >
                    {t('search.loadMoreResults')}
                  </Button>

                  <div>
                    {t('search.resultsRemaining', {
                      count: lastPage.remaining,
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
