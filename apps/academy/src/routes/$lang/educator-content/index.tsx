import { EducatorContentStatus, EducatorContentType } from '@blms/constants';
import type { JoinedEducatorContent } from '@blms/types';
import { cn, DropdownMenu, EmptyState, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { capitalize } from 'lodash-es';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TbAdjustmentsHorizontal,
  TbChevronRight,
  TbDownload,
  TbSearch,
  TbX,
} from 'react-icons/tb';
import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { Pagination } from '#src/components/pagination.tsx';
import { SearchInput } from '#src/components/search-input.tsx';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';
import { getEducatorContentCoverUrl } from '#src/services/content.js';
import { getLanguageName, LANGUAGES } from '#src/utils/i18n.ts';
import { trpc } from '#src/utils/trpc.js';
import { EducatorContentModal } from './-components/educator-content-modal.tsx';

export const Route = createFileRoute('/$lang/educator-content/')({
  component: RouteComponent,
});

const ITEMS_PER_PAGE = 10;
const FILTERS_STORAGE_KEY = 'educatorContentFilters';

interface SavedFilters {
  selectedType: EducatorContentType | 'all';
  selectedLanguage: string;
  searchQuery: string;
  sortBy: 'recent' | 'downloads';
}

function RouteComponent() {
  const { i18n, t } = useTranslation();
  const { session } = useContext(AppContext);
  const isLoggedIn = !!session?.user;

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const {
    open: openAddContentModal,
    isOpen: isAddContentModalOpen,
    close: closeAddContentModal,
  } = useDisclosure();

  const { data: content, isLoading } = useQuery(
    trpc.content.getEducatorContents.queryOptions({
      status: EducatorContentStatus.Published,
    }),
  );

  const { data: userContent } = useQuery(
    trpc.content.getEducatorContents.queryOptions(
      {
        uid: session?.user?.uid,
      },
      {
        enabled: isLoggedIn,
      },
    ),
  );

  const hasCreatedContent = userContent && userContent.length > 0;

  const isMobile = useSmaller('lg');

  // Load saved filters from localStorage
  const loadSavedFilters = (): Partial<SavedFilters> => {
    try {
      const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const savedFilters = loadSavedFilters();

  const [selectedType, setSelectedType] = useState<EducatorContentType | 'all'>(
    savedFilters.selectedType || 'all',
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    savedFilters.selectedLanguage || 'all',
  );
  const [searchQuery, setSearchQuery] = useState(
    savedFilters.searchQuery || '',
  );
  const [sortBy, setSortBy] = useState<'recent' | 'downloads'>(
    savedFilters.sortBy || 'recent',
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filtersToSave: SavedFilters = {
      selectedType,
      selectedLanguage,
      searchQuery,
      sortBy,
    };
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  }, [selectedType, selectedLanguage, searchQuery, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedLanguage, searchQuery, sortBy]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const filteredContent = useMemo(() => {
    if (!content) return [];

    // 1. Filter
    const filtered = content.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesLanguage =
        selectedLanguage === 'all' || item.language === selectedLanguage;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesLanguage && matchesSearch;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'downloads') {
        return (b.downloads || 0) - (a.downloads || 0);
      }
      return 0;
    });
  }, [content, selectedType, selectedLanguage, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE);

  const paginatedContent = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredContent.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredContent, currentPage]);

  const handleAddContentClick = () => {
    if (isLoggedIn) {
      openAddContentModal();
    } else {
      openAuthModal();
    }
  };

  const types = [
    {
      id: 'all',
      name: t('words.all'),
      onClick: () => setSelectedType('all'),
    },
    ...Object.values(EducatorContentType)
      .map((type) => ({
        id: type,
        name: t(`educatorContent.types.${type}`),
        onClick: () => setSelectedType(type),
      }))
      .sort((a, b) => {
        if (a.id === EducatorContentType.Other) return 1;
        if (b.id === EducatorContentType.Other) return -1;
        return a.name.localeCompare(b.name);
      }),
  ];

  const languages = [
    {
      id: 'all',
      name: t('words.all'),
      onClick: () => setSelectedLanguage('all'),
    },
    ...LANGUAGES.map((lang) => ({
      id: lang,
      name: capitalize(getLanguageName(lang)),
      onClick: () => setSelectedLanguage(lang),
    })).sort((a, b) => a.name.localeCompare(b.name)),
  ];

  return (
    <PageLayout
      title={t('educatorContent.pageTitle')}
      subtitle={t('educatorContent.pageSubtitle')}
      layoutSize="base"
      actionButtons={[
        {
          text: t('educatorContent.addMaterial'),
          onClick: handleAddContentClick,
        },
      ]}
      tabs={
        isLoggedIn && hasCreatedContent
          ? [
              {
                id: 'educator-content',
                label: t('menu.educatorContent'),
                href: '/educator-content',
              },
              ...(hasCreatedContent
                ? [
                    {
                      id: 'my-content',
                      label: t('educatorContent.myContent'),
                      href: '/educator-content/my-content',
                    },
                  ]
                : []),
            ]
          : []
      }
      showBecomeTeacherButton
    >
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Mobile Search filter */}
          <div
            className={cn(
              'flex items-center gap-2 w-full justify-end my-2 mb-6 lg:hidden',
            )}
          >
            <SearchInput
              searchTerm={searchQuery}
              setSearchTerm={setSearchQuery}
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
              'max-lg:mx-auto lg:mt-4 mt-8 mb-8',
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
                types.find((t) => t.id === selectedType)?.name || 'Type'
              }
              itemsList={types.filter((t) => t.id !== selectedType)}
              variant="light"
              placeholder={t('educatorContent.typePlaceholder')}
              forcePlaceholder={selectedType === 'all'}
              className="w-full lg:w-44"
            />
            <DropdownMenu
              activeItem={
                languages.find((l) => l.id === selectedLanguage)?.name ||
                'Language'
              }
              itemsList={languages.filter((l) => l.id !== selectedLanguage)}
              variant="light"
              placeholder={t('educatorContent.languagePlaceholderFilter')}
              forcePlaceholder={selectedLanguage === 'all'}
              className="w-full lg:w-40"
            />
            <SearchInput
              searchTerm={searchQuery}
              setSearchTerm={setSearchQuery}
              className="max-lg:hidden"
            />
          </div>

          <div className="flex w-full justify-end items-center gap-2 max-lg:hidden mb-6">
            <span className="text-sm text-gray-500">
              {t('educatorContent.sortBy')}
            </span>
            <button
              type="button"
              onClick={() =>
                setSortBy((prev) =>
                  prev === 'recent' ? 'downloads' : 'recent',
                )
              }
              className="text-sm font-medium text-gray-900 hover:text-orange-500 transition-colors"
            >
              {sortBy === 'recent'
                ? t('educatorContent.sortMostRecent')
                : t('educatorContent.sortMostDownloaded')}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {filteredContent && filteredContent.length === 0 ? (
              <EmptyState
                title={t('educatorContent.noResultsTitle')}
                description={t('educatorContent.noResultsDescription')}
                icon={TbSearch}
              />
            ) : null}
            {paginatedContent?.map((item: JoinedEducatorContent) => (
              <Link
                to="/$lang/educator-content/$id"
                params={{ lang: i18n.language, id: item.id }}
                key={item.id}
                className="flex w-full justify-between gap-2 md:gap-6 items-center pr-4 bg-white rounded-2xl hover:bg-neutral-50 cursor-pointer"
              >
                <div className="flex gap-3 md:gap-6 items-center">
                  {/* Thumbnail */}
                  <div className="w-28 h-21 md:w-32 md:h-24 bg-gray-200 rounded-lg md:rounded-2xl shrink-0 overflow-hidden flex items-center justify-center">
                    {item.cover ? (
                      <img
                        src={getEducatorContentCoverUrl(item.cover) || ''}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">
                        {t('educatorContent.noCover')}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="grow flex flex-col justify-center gap-2">
                    <h3 className="title-small md:title-base text-gray-900">
                      {item.title}
                    </h3>
                    {item.downloads > 0 ? (
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <TbDownload size={16} />
                        <span>{item.downloads}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Arrow */}
                <TbChevronRight
                  className="text-neutral-300 shrink-0"
                  size={isMobile ? 16 : 24}
                />
              </Link>
            ))}

            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <EducatorContentModal
        isOpen={isAddContentModalOpen}
        onClose={closeAddContentModal}
      />
    </PageLayout>
  );
}
