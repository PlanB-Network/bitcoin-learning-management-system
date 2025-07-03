import { SortDirection } from '@blms/constants';
import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@blms/ui';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineSearch } from 'react-icons/ai';
import { MdKeyboardArrowDown, MdThumbDown, MdThumbUp } from 'react-icons/md';
import { TbArrowsSort } from 'react-icons/tb';
import { useDebounce } from '#src/utils/search.ts';
import { trpc } from '#src/utils/trpc.ts';

export const DashboardTutorialsTable = ({
  professorId,
}: {
  professorId?: string;
}) => {
  const { i18n } = useTranslation();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [sortConfig, setSortConfig] = useState<{
    key: 'category' | 'professorName' | 'title' | 'likeCount' | 'dislikeCount';
    direction: SortDirection;
  }>({
    direction: SortDirection.Asc,
    key: 'title',
  });

  const {
    data: tutorialsPages,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(
    trpc.content.getTutorialsWithProfessorName.infiniteQueryOptions(
      {
        language: i18n.language || 'en',
        limit: professorId ? 100 : 50,
        orderDirection: sortConfig.direction,
        orderField: sortConfig.key,
        professorId: professorId,
        search: debouncedSearch,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
      },
    ),
  );

  const tutorials = [];
  const seenIds = new Set();

  for (const page of tutorialsPages?.pages || []) {
    for (const tutorial of page.tutorials) {
      if (!seenIds.has(tutorial.id)) {
        seenIds.add(tutorial.id);
        tutorials.push(tutorial);
      }
    }
  }

  // Workaround for sorting by category+subcategory, preventing cursor jumping on query
  if (sortConfig.key === 'category') {
    tutorials.sort((a, b) => {
      const categoryA = a.category.toLowerCase();
      const categoryB = b.category.toLowerCase();
      const subcategoryA = a.subcategory?.toLowerCase() || '';
      const subcategoryB = b.subcategory?.toLowerCase() || '';

      if (categoryA === categoryB) {
        return sortConfig.direction === 'asc'
          ? subcategoryA.localeCompare(subcategoryB)
          : subcategoryB.localeCompare(subcategoryA);
      }

      return sortConfig.direction === 'asc'
        ? categoryA.localeCompare(categoryB)
        : categoryB.localeCompare(categoryA);
    });
  }

  useEffect(() => {
    refetch();
  }, [debouncedSearch, sortConfig, refetch]);

  // Load more on scroll
  const loaderRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 },
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) observer.observe(currentLoaderRef);

    return () => {
      if (currentLoaderRef) observer.unobserve(currentLoaderRef);
    };
  }, [fetchNextPage, hasNextPage]);

  // Handle sorting logic
  const handleSorting = (key: typeof sortConfig.key) => {
    setSortConfig((prev) => ({
      direction:
        prev.key === key && prev.direction === SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc,
      key,
    }));
  };

  return (
    <>
      <div className="relative w-full max-w-[600px] mb-5 mt-10">
        <input
          type="text"
          placeholder={t('dashboard.adminPanel.searchByNameOrCategory')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full pl-5 pr-12 py-3 rounded-[25px] bg-newGray-5 text-newBlack-1 placeholder:text-newGray-1 body-14px"
        />
        <AiOutlineSearch
          size={24}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-newBlack-1"
        />
      </div>

      <Table>
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow>
            <TableHead
              onClick={() => handleSorting('category')}
              className={cn(professorId && 'max-md:hidden', 'w-[240px]')}
            >
              <div className="flex gap-2.5 items-center">
                <span>{t('words.category')}</span>
                {sortConfig.key === 'category' ? (
                  <MdKeyboardArrowDown
                    className={cn(
                      'shrink-0 transition-all',
                      sortConfig.direction === 'desc'
                        ? '-rotate-180'
                        : 'rotate-0',
                    )}
                    size={24}
                  />
                ) : (
                  <TbArrowsSort className="shrink-0" size={24} />
                )}
              </div>
            </TableHead>

            {!professorId && (
              <TableHead
                className={cn('w-[180px]')}
                onClick={() => handleSorting('professorName')}
              >
                <div className="flex gap-2.5 items-center">
                  <span>{t('words.author')}</span>
                  {sortConfig.key === 'professorName' ? (
                    <MdKeyboardArrowDown
                      className={cn(
                        'shrink-0 transition-all',
                        sortConfig.direction === 'desc'
                          ? '-rotate-180'
                          : 'rotate-0',
                      )}
                      size={24}
                    />
                  ) : (
                    <TbArrowsSort className="shrink-0" size={24} />
                  )}
                </div>
              </TableHead>
            )}

            <TableHead
              className={cn(professorId ? '' : 'w-[290px]')}
              onClick={() => handleSorting('title')}
            >
              <div className="flex gap-2.5 items-center">
                <span>{t('tutorials.details.tutorialName')}</span>
                {sortConfig.key === 'title' ? (
                  <MdKeyboardArrowDown
                    className={cn(
                      'shrink-0 transition-all max-md:hidden',
                      sortConfig.direction === 'desc'
                        ? '-rotate-180'
                        : 'rotate-0',
                    )}
                    size={24}
                  />
                ) : (
                  <TbArrowsSort className="shrink-0 max-md:hidden" size={24} />
                )}
              </div>
            </TableHead>

            <TableHead
              className={cn('w-[60px] md:w-[100px]')}
              onClick={() => handleSorting('likeCount')}
            >
              <div className="flex gap-2.5 items-center justify-center">
                <span className={cn('max-md:hidden')}>{t('words.likes')}</span>
                <MdThumbUp
                  size={18}
                  className={cn('md:hidden text-darkGreen-1 shrink-0')}
                />
                {sortConfig.key === 'likeCount' ? (
                  <MdKeyboardArrowDown
                    className={cn(
                      'shrink-0 transition-all',
                      sortConfig.direction === 'desc'
                        ? '-rotate-180'
                        : 'rotate-0',
                    )}
                    size={24}
                  />
                ) : (
                  <TbArrowsSort className="shrink-0" size={24} />
                )}
              </div>
            </TableHead>

            <TableHead
              className={cn('w-[60px] md:w-[100px]')}
              onClick={() => handleSorting('dislikeCount')}
            >
              <div className="flex gap-2.5 items-center justify-center">
                <span className={cn('max-md:hidden')}>
                  {t('words.dislikes')}
                </span>
                <MdThumbDown
                  size={18}
                  className={cn('md:hidden text-red-5 shrink-0')}
                />
                {sortConfig.key === 'dislikeCount' ? (
                  <MdKeyboardArrowDown
                    className={cn(
                      'shrink-0 transition-all',
                      sortConfig.direction === 'desc'
                        ? '-rotate-180'
                        : 'rotate-0',
                    )}
                    size={24}
                  />
                ) : (
                  <TbArrowsSort className="shrink-0" size={24} />
                )}
              </div>
            </TableHead>

            <TableHead
              className={cn(
                professorId && 'max-md:hidden',
                'w-[130px] text-center',
              )}
            >
              {t('dashboard.adminPanel.githubLink')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tutorials.map((tutorial) => (
            <TableRow key={tutorial.id}>
              <TableCell
                className={cn(professorId && 'max-md:hidden', 'capitalize')}
              >
                {tutorial.category}/{tutorial.subcategory}
              </TableCell>

              {!professorId && (
                <TableCell>{tutorial.professorName || '/'}</TableCell>
              )}

              <TableCell>
                <Link
                  to={`/tutorials/${tutorial.category}/${tutorial.subcategory}/${tutorial.name}-${tutorial.id}`}
                  target="_blank"
                  className="w-fit hover:font-medium hover:underline"
                >
                  {tutorial.title}
                </Link>
              </TableCell>

              <TableCell>
                <div className="flex w-full justify-center items-center gap-2">
                  <span>{tutorial.likeCount}</span>
                  <MdThumbUp size={18} className="text-darkGreen-1 shrink-0" />
                </div>
              </TableCell>

              <TableCell>
                <div className="flex w-full justify-center items-center gap-2">
                  <span>{tutorial.dislikeCount}</span>
                  <MdThumbDown size={18} className="text-red-5 shrink-0" />
                </div>
              </TableCell>

              <TableCell
                className={cn(professorId && 'max-md:hidden', 'text-center')}
              >
                <a
                  href={`https://github.com/PlanB-Network/bitcoin-educational-content/tree/dev/${tutorial.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-darkOrange-5 underline"
                >
                  {t('dashboard.adminPanel.seeOrEdit')}
                </a>
              </TableCell>
            </TableRow>
          ))}
          {hasNextPage && <TableRow ref={loaderRef} />}
        </TableBody>
      </Table>
    </>
  );
};
