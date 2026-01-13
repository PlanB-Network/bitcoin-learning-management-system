import { ResourceType } from '@blms/constants';
import { Button, cn, DropdownMenu, HorizontalCard, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbAdjustmentsHorizontal, TbChevronsDown, TbX } from 'react-icons/tb';
import PaperImage from '#src/assets/resources/paper.png';
import { PageLayout } from '#src/components/page-layout.tsx';
import { SearchInput } from '#src/components/search-input.tsx';
import { trpc } from '#src/utils/trpc.js';
import { AddResourceModal } from '../-components/add-resource-modal.tsx';

import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/resources/papers/')({
  component: ResearchPapers,
});

function ResearchPapers() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [shownPapersCount, setShownPapersCount] = useState(10);
  const [activeType, setActiveType] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: papers, isFetched } = useQuery(
    trpc.content.getResearchPapers.queryOptions(
      {},
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  const paperTypes = useMemo(() => {
    if (!papers) return [];
    return Array.from(new Set(papers.map((p) => p.type))).sort();
  }, [papers]);

  const types = useMemo(
    () => [
      { id: 'all', name: t('words.all') },
      ...paperTypes.map((type) => ({
        id: type,
        name: t(`resources.papers.types.${type}`, {
          defaultValue: type,
        }),
      })),
    ],
    [t, paperTypes],
  );

  const filteredPapers = useMemo(() => {
    if (!papers) return [];

    return papers
      .filter((paper) => {
        const lowerTerm = searchTerm.toLowerCase();
        const matchesSearch =
          paper.title.toLowerCase().includes(lowerTerm) ||
          paper.authors.some((author) =>
            author.toLowerCase().includes(lowerTerm),
          ) ||
          paper.topics?.some((topic) =>
            topic.toLowerCase().includes(lowerTerm),
          ) ||
          paper.language.toLowerCase().includes(lowerTerm);

        const matchesType = activeType === 'all' || paper.type === activeType;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'recent' || sortBy === 'oldest') {
          const dateA = a.publicationDate
            ? new Date(a.publicationDate).getTime()
            : 0;
          const dateB = b.publicationDate
            ? new Date(b.publicationDate).getTime()
            : 0;

          return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
        }

        return a.title.localeCompare(b.title);
      });
  }, [papers, searchTerm, activeType, sortBy]);

  return (
    <PageLayout
      title={t('resources.papers.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
      actionButtons={[
        {
          text: t('resources.addResource.paper'),
          onClick: () => setIsModalOpen(true),
        },
      ]}
    >
      <AddResourceModal
        resourceType={ResourceType.Paper}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {!isFetched && <Loader size={'s'} />}
      {isFetched && (
        <>
          {/* Mobile search */}
          <div
            className={cn(
              'flex items-center gap-2 w-full justify-end mb-4 lg:hidden',
            )}
          >
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <button
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="p-2 rounded-lg bg-neutral-50 text-neutral-400 flex items-center gap-2"
              type="button"
            >
              <span className="body-base">{t('words.filters')}</span>
              {isFilterOpen ? (
                <TbX size={16} />
              ) : (
                <TbAdjustmentsHorizontal size={16} />
              )}
            </button>
          </div>

          {/* Filters */}
          <div
            className={cn(
              'flex lg:justify-end max-lg:flex-col gap-1 lg:gap-2',
              'max-lg:p-2 max-lg:rounded-lg max-lg:w-full max-lg:max-w-90',
              'max-lg:mx-auto mb-4',
              isFilterOpen ? '' : 'max-lg:hidden',
            )}
          >
            <div className="lg:hidden flex justify-between items-center w-full mb-1 px-1">
              <span className="body-small-bold text-neutral-700">
                {t('words.filters')}
              </span>
            </div>

            <DropdownMenu
              activeItem={
                types.find((type) => type.id === activeType)?.name || 'Type'
              }
              itemsList={types
                .filter((type) => type.id !== activeType)
                .map((type) => ({
                  ...type,
                  onClick: () => setActiveType(type.id),
                }))}
              variant="light"
              placeholder={t('words.type')}
              forcePlaceholder={activeType === 'all'}
              className="w-full lg:w-44"
            />
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              className="max-lg:hidden"
            />
          </div>

          {/* Sort */}
          <div className="flex w-full justify-end items-center gap-2 mb-4 lg:mb-6">
            <span className="text-sm text-neutral-500">
              {t('educatorContent.sortBy')}
            </span>
            <button
              type="button"
              onClick={() =>
                setSortBy((prev) => (prev === 'recent' ? 'oldest' : 'recent'))
              }
              className="text-sm font-medium text-neutral-900 hover:text-orange-500 transition-colors"
            >
              {sortBy === 'recent'
                ? t('educatorContent.sortMostRecent')
                : t('words.oldest')}
            </button>
          </div>

          {/* Papers list */}
          <div className="w-full flex flex-col gap-1 sm:gap-2">
            {filteredPapers.slice(0, shownPapersCount).map((paper) => (
              <HorizontalCard
                key={paper.id}
                title={paper.title}
                subtitle={`${paper.authors.join(', ')}${
                  paper.publicationDate
                    ? ` • ${new Date(paper.publicationDate).getFullYear()}`
                    : ''
                }`}
                link={`/resources/papers/${
                  paper.title
                    ? paper.title.toLowerCase().replace(/\s+/g, '-')
                    : ''
                }-${paper.id}`}
                thumbnail={PaperImage}
                hideMobileThumbnail
                hideThumbnailBorder
              />
            ))}
          </div>

          {shownPapersCount < filteredPapers.length && (
            <Button
              className="w-full gap-4 mt-4"
              variant="newTertiary"
              onClick={() => setShownPapersCount(shownPapersCount + 10)}
            >
              {t('resources.papers.showMorePapers')}
              <TbChevronsDown size={16} />
            </Button>
          )}
        </>
      )}
    </PageLayout>
  );
}
