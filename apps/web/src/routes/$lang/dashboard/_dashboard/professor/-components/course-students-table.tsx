import { SortDirection } from '@blms/constants';
import type { CourseStudent, JoinedCourse } from '@blms/types';
import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextTag,
} from '@blms/ui';
import { useInfiniteQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { TbArrowDown, TbArrowsSort, TbSearch } from 'react-icons/tb';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { useDebounce } from '#src/utils/search.ts';
import { trpc } from '#src/utils/trpc.ts';
import { getNotificationDateString } from '../../notifications.tsx';

export const CourseStudentsTable = ({ course }: { course: JoinedCourse }) => {
  const isMobile = useSmaller('md');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [sortConfig, setSortConfig] = useState<{
    key:
      | 'displayName'
      | 'amount'
      | 'courseProgress'
      | 'totalScore'
      | 'lastActive';
    direction: SortDirection;
  }>({
    direction: SortDirection.Asc,
    key: 'displayName',
  });

  const {
    data: studentsPages,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(
    trpc.user.courses.getStudentsByCourseId.infiniteQueryOptions(
      {
        limit: 100,
        orderDirection: sortConfig.direction,
        orderField: sortConfig.key,
        courseId: course.id,
        search: debouncedSearch,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
      },
    ),
  );

  const students: CourseStudent[] = [];
  const seenIds = new Set();

  for (const page of studentsPages?.pages || []) {
    for (const student of page.students) {
      if (!seenIds.has(student.uid)) {
        seenIds.add(student.uid);
        students.push(student);
      }
    }
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

  const [hasScores, setHasScores] = useState(false);
  useEffect(() => {
    if (students.length > 0) {
      const anyScores = students.some(
        (student) => student.totalScore !== null || student.examScore !== null,
      );
      if (anyScores) {
        setHasScores(true);
      }
    }
  }, [students]);

  return (
    <>
      <div className="relative w-full max-w-[224px] mb-6 mt-4">
        <input
          type="text"
          placeholder={`${t('words.search')}...`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full p-3 rounded-xl bg-newGray-5 text-newBlack-1 placeholder:text-newGray-1 body-12px md:body-14px"
        />
        <TbSearch
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
      </div>

      <Table>
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow>
            <TableHead
              onClick={() => handleSorting('displayName')}
              className={cn('w-[240px] md:w-[340px]')}
            >
              <div className="flex gap-2.5 items-center">
                <span>{t('words.student')}</span>
                {sortConfig.key === 'displayName' ? (
                  <TbArrowDown
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

            {course.requiresPayment && (
              <TableHead
                className={cn('w-45')}
                onClick={() => handleSorting('amount')}
              >
                <div className="flex gap-2.5 items-center">
                  <span>{t('dashboard.teacher.courses.amountPaid')}</span>
                  {sortConfig.key === 'amount' ? (
                    <TbArrowDown
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
              className={cn('w-45')}
              onClick={() => handleSorting('courseProgress')}
            >
              <div className="flex gap-2.5 items-center">
                <span>{t('words.status')}</span>
                {sortConfig.key === 'courseProgress' ? (
                  <TbArrowDown
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

            {hasScores && (
              <TableHead
                className={cn('w-45')}
                onClick={() => handleSorting('totalScore')}
              >
                <div className="flex gap-2.5 items-center">
                  <span>{t('courses.exam.finalScore')}</span>
                  {sortConfig.key === 'totalScore' ? (
                    <TbArrowDown
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
              className={cn('w-45')}
              onClick={() => handleSorting('lastActive')}
            >
              <div className="flex gap-2.5 items-center">
                <span>{t('dashboard.teacher.courses.lastActive')}</span>
                {sortConfig.key === 'lastActive' ? (
                  <TbArrowDown
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const hasStudentCompletedCourse = student.courseProgress >= 100;
            const hasStudentStartedCourse =
              !hasStudentCompletedCourse && student.courseProgress > 0;

            return (
              <TableRow key={student.uid}>
                <TableCell>{student.displayName}</TableCell>

                {course.requiresPayment && (
                  <TableCell>
                    {student.method && student.method !== 'free'
                      ? `${student.amount?.toLocaleString('fr-FR')} ${
                          student.method === 'stripe'
                            ? '$'
                            : t('words.sats').toLowerCase()
                        }`
                      : '0'}
                  </TableCell>
                )}

                <TableCell>
                  <TextTag
                    size={isMobile ? 'verySmall' : 'small'}
                    mode="light"
                    variant={
                      hasStudentCompletedCourse
                        ? 'green'
                        : hasStudentStartedCourse
                          ? 'yellow'
                          : 'grey'
                    }
                  >
                    {hasStudentCompletedCourse
                      ? t('words.completed')
                      : hasStudentStartedCourse
                        ? `${student.courseProgress}%`
                        : t('words.enrolled')}
                  </TextTag>
                </TableCell>

                {hasScores && (
                  <TableCell>
                    {(student.totalScore ?? student.examScore) !== null
                      ? `${student.totalScore ?? student.examScore}/100`
                      : 'N/A'}
                  </TableCell>
                )}

                <TableCell>
                  {getNotificationDateString(student.lastActive)}
                </TableCell>
              </TableRow>
            );
          })}
          {hasNextPage && <TableRow ref={loaderRef} />}
        </TableBody>
      </Table>
    </>
  );
};
