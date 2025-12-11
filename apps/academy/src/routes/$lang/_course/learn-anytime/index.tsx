import { TeachingFormat } from '@blms/constants';
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselFadeEdges,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  cn,
  DropdownMenu,
  EmptyState,
  Loader,
  Progress,
} from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';
import { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TbAdjustmentsHorizontal,
  TbBooksOff,
  TbChevronsDown,
  TbX,
} from 'react-icons/tb';
import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import { PageTitle } from '#src/components/page-header.tsx';
import { PageLayout } from '#src/components/page-layout.js';
import { SearchInput } from '#src/components/search-input.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { CourseCard } from '#src/patterns/course-card.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { normalizeString, toCamelCase } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute('/$lang/_course/learn-anytime/')({
  component: AllCourses,
});

function AllCourses() {
  const { courses, session } = useContext(AppContext);
  const { i18n } = useTranslation();

  const isMobile = useSmaller('md') || window.innerWidth < 768;

  const isLoggedIn = !!session?.user;

  const { data: coursesProgress } = useQuery(
    trpc.user.courses.getProgress.queryOptions(
      {
        teachingFormat: TeachingFormat.SelfPaced,
      },
      {
        enabled: isLoggedIn,
      },
    ),
  );

  const inProgressCourses = useMemo(() => {
    if (!coursesProgress || !courses) return [];
    return coursesProgress
      .filter(
        (course) =>
          course.progressPercentage > 0 && course.progressPercentage < 100,
      )
      .sort((a, b) => {
        if (b.lastUpdated && a.lastUpdated) {
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
        }
        if (b.lastUpdated) return 1;
        if (a.lastUpdated) return -1;
        return 0;
      });
  }, [coursesProgress, courses]);

  const [activeTopic, setActiveTopic] = useState('all');
  const [activeLevel, setActiveLevel] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [activePrice, setActivePrice] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleExpand = (topicId: string) => {
    setExpandedTopics((prev) =>
      prev.includes(topicId) ? prev : [...prev, topicId],
    );
  };

  const uniqueTopics = useMemo(() => {
    if (!courses) return [];

    const desiredOrder = [
      'bitcoin',
      'security',
      'social studies',
      'business',
      'protocol',
      'mining',
    ];

    const orderMap = new Map(
      desiredOrder.map((name, i) => [normalizeString(name), i]),
    );

    const topicsSet = Array.from(
      new Set(
        courses
          .filter(
            (course) => course.teachingFormat === TeachingFormat.SelfPaced,
          )
          .map((c) => c.topic),
      ),
    );

    return topicsSet.sort((a, b) => {
      const na = normalizeString(a);
      const nb = normalizeString(b);

      const ia = orderMap.has(na) ? orderMap.get(na)! : Number.MAX_SAFE_INTEGER;
      const ib = orderMap.has(nb) ? orderMap.get(nb)! : Number.MAX_SAFE_INTEGER;

      if (ia !== ib) return ia - ib;
      return na.localeCompare(nb);
    });
  }, [courses]);

  const topics = useMemo(
    () => [
      { id: 'all', name: t('words.all') },
      ...uniqueTopics.map((topic) => ({
        id: topic.toLowerCase(),
        name: t(`words.${toCamelCase(topic)}`),
      })),
    ],
    [uniqueTopics, t],
  );

  const levels = [
    { id: 'all', name: t('words.all') },
    { id: 'beginner', name: t('words.level.beginner') },
    { id: 'intermediate', name: t('words.level.intermediate') },
    { id: 'advanced', name: t('words.level.advanced') },
    { id: 'expert', name: t('words.level.expert') },
  ];

  const types = [
    { id: 'all', name: t('words.all') },
    { id: 'theory', name: t('words.theory') },
    { id: 'practice', name: t('words.practice') },
  ];

  const prices = [
    { id: 'all', name: t('words.all') },
    { id: 'free', name: t('words.free') },
    { id: 'paid', name: t('words.paid') },
  ];

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses
      .filter(
        (course) =>
          course.isArchived === false &&
          normalizeString(course.language) === normalizeString(i18n.language) &&
          course.teachingFormat === 'self_paced' &&
          (!course.paymentExpirationDate ||
            course.paymentExpirationDate > new Date()) &&
          (activeTopic === 'all'
            ? true
            : normalizeString(course.topic) === activeTopic) &&
          (activeLevel === 'all' ? true : course.level === activeLevel) &&
          (activeType === 'all' ? true : course.type === activeType) &&
          (activePrice === 'all'
            ? true
            : activePrice === 'free'
              ? course.requiresPayment === false
              : course.requiresPayment === true) &&
          (searchTerm === ''
            ? true
            : normalizeString(course.name).includes(
                normalizeString(searchTerm),
              ) ||
              normalizeString(course.goal).includes(
                normalizeString(searchTerm),
              )),
      )
      .sort((a, b) => a.index.slice(3).localeCompare(b.index.slice(3)));
  }, [
    courses,
    i18n.language,
    activeTopic,
    activeLevel,
    activeType,
    activePrice,
    searchTerm,
  ]);

  const hasAllCourses = useMemo(() => {
    return (
      activeTopic === 'all' &&
      activeLevel === 'all' &&
      activeType === 'all' &&
      activePrice === 'all' &&
      searchTerm === ''
    );
  }, [activeTopic, activeLevel, activeType, activePrice, searchTerm]);

  const showResetFiltersButton = useMemo(() => {
    return (
      activeTopic !== 'all' ||
      activeLevel !== 'all' ||
      activeType !== 'all' ||
      activePrice !== 'all' ||
      searchTerm !== ''
    );
  }, [activeTopic, activeLevel, activeType, activePrice, searchTerm]);

  const resetFilters = () => {
    setActiveTopic('all');
    setActiveLevel('all');
    setActiveType('all');
    setActivePrice('all');
    setSearchTerm('');
  };

  if (!courses) {
    return (
      <PageLayout title={t('courses.allCourses')} showBecomeTeacherButton>
        <Loader size="s" />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      tabs={[
        { id: 'all', label: t('courses.allCourses'), href: '/learn-anytime' },
        {
          id: 'course-selector',
          label: t('courses.courseSelector'),
          href: '/learn-anytime/course-selector',
        },
      ]}
      title={t('courses.allCourses')}
      hideTitle
      showBecomeTeacherButton
    >
      {inProgressCourses.length !== 0 && (
        <div className="flex flex-col w-full gap-4 mb-6 md:mb-12">
          <p className="text-black title-base md:title-medium">
            {t('courses.continueLeftOff')}
          </p>
          <div className="flex flex-col gap-1 md:gap-4 w-full">
            {inProgressCourses.slice(0, 2).map((courseProgress) => {
              const course = courses.find(
                (c) => c.id === courseProgress.courseId,
              );
              if (!course) return null;
              return (
                <article
                  className="flex items-center justify-between w-full border border-neutral-100 rounded-2xl p-3 md:p-8 gap-2"
                  key={course.id}
                >
                  <span className="body-small-bold md:subtitle-base text-black">
                    {course.name}
                  </span>
                  <div className="flex items-center gap-3 md:gap-12 xl:w-full xl:max-w-[463px]">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-full max-w-[272px] relative max-xl:hidden">
                        <Progress
                          total={courseProgress.totalChapters}
                          completed={courseProgress.completedChaptersCount}
                          pillImage={OrangePill}
                        />
                      </div>
                      <span className="body-extra-small-bold md:subtitle-base text-orange-500">
                        {courseProgress.progressPercentage}%
                      </span>
                    </div>
                    <Link
                      to={`/courses/${course.id}/${courseProgress?.nextChapter?.chapterId}`}
                    >
                      <Button
                        rounded
                        variant="primary"
                        className="w-full"
                        size={isMobile ? 's' : 'm'}
                      >
                        {t('words.resume')}
                      </Button>
                    </Link>
                  </div>
                </article>
              );
            })}
            {inProgressCourses.length > 2 && (
              <div className="ml-auto">
                <Link
                  to="/my-courses"
                  className="body-small-bold text-black pr-8"
                >
                  {t('courses.plusXMore', {
                    count: inProgressCourses.length - 2,
                  })}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      <PageTitle title={t('courses.allCourses')} />

      <div
        className={cn(
          'flex items-center gap-2 w-full justify-end my-2 lg:hidden',
        )}
      >
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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

      <div
        className={cn(
          'lg:ml-auto flex max-lg:flex-col lg:items-center lg:justify-end gap-1 lg:gap-2 lg:max-w-200 lg:w-full max-lg:border border-neutral-100 max-lg:p-2 max-lg:rounded-lg max-lg:w-full max-lg:max-w-90 max-lg:mx-auto lg:mt-4',
          isFilterOpen ? 'max-lg:mb-2' : 'max-lg:hidden',
        )}
      >
        <div className="lg:hidden flex justify-between items-center w-full mb-1 px-1">
          <span className="body-small-bold text-neutral-700">
            {t('words.filters')}
          </span>
          {showResetFiltersButton && (
            <button
              onClick={() => {
                resetFilters();
              }}
              className="body-small-bold text-orange-500"
              type="button"
            >
              {t('words.resetAll')}
            </button>
          )}
        </div>

        {/* Topic */}
        <DropdownMenu
          activeItem={
            topics.find((topic) => topic.id === activeTopic)?.name || ''
          }
          itemsList={topics
            .map((topic) => ({
              id: topic.id,
              name: capitalize(topic.name),
              onClick: () => setActiveTopic(topic.id),
            }))
            .filter((item) => item.id !== activeTopic)}
          variant="light"
          placeholder={t('words.topic')}
          forcePlaceholder={activeTopic === 'all'}
        />
        {/* Level */}
        <DropdownMenu
          activeItem={
            levels.find((level) => level.id === activeLevel)?.name || ''
          }
          itemsList={levels
            .map((level) => ({
              id: level.id,
              name: capitalize(level.name),
              onClick: () => setActiveLevel(level.id),
            }))
            .filter((item) => item.id !== activeLevel)}
          variant="light"
          placeholder={t('words.level.level')}
          forcePlaceholder={activeLevel === 'all'}
        />
        {/* Type */}
        <DropdownMenu
          activeItem={types.find((type) => type.id === activeType)?.name || ''}
          itemsList={types
            .map((type) => ({
              id: type.id,
              name: capitalize(type.name),
              onClick: () => setActiveType(type.id),
            }))
            .filter((item) => item.id !== activeType)}
          variant="light"
          placeholder={t('words.type')}
          forcePlaceholder={activeType === 'all'}
        />
        {/* Price */}
        <DropdownMenu
          activeItem={
            prices.find((price) => price.id === activePrice)?.name || ''
          }
          itemsList={prices
            .map((price) => ({
              id: price.id,
              name: capitalize(price.name),
              onClick: () => setActivePrice(price.id),
            }))
            .filter((item) => item.id !== activePrice)}
          variant="light"
          placeholder={t('words.price')}
          forcePlaceholder={activePrice === 'all'}
        />
        {/* Search */}
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          className="max-lg:hidden"
        />
      </div>

      {hasAllCourses ? (
        <div className="flex flex-col gap-2 md:gap-12 lg:mt-6">
          {topics
            .filter((topic) => topic.id !== 'all')
            .map((topic) => {
              const topicCourses = filteredCourses.filter(
                (course) => normalizeString(course.topic) === topic.id,
              );

              if (topicCourses.length === 0) return null;

              const isExpanded = expandedTopics.includes(topic.id);
              const visibleCourses = isExpanded
                ? topicCourses
                : topicCourses.slice(0, 4);

              return (
                <section key={topic.id}>
                  <h2 className="title-base md:title-large mb-2 md:mb-4 text-black">
                    {topic.name}
                  </h2>
                  <Carousel
                    className="max-md:hidden"
                    opts={{ slidesToScroll: 3, duration: 14 }}
                  >
                    <CarouselContent className="">
                      {topicCourses.map((course) => (
                        <CarouselItem key={course.id}>
                          <CourseCard course={course} mode="light" />
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    <CarouselPrevious
                      variant="primary"
                      rounded
                      className="z-10"
                    />
                    <CarouselNext variant="primary" rounded className="z-10" />
                    <CarouselFadeEdges />
                  </Carousel>

                  <div className="flex flex-col gap-2 md:hidden">
                    {visibleCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        mode="light"
                      />
                    ))}
                    {!isExpanded && topicCourses.length > 4 && (
                      <div className="w-full relative flex items-center justify-center my-2">
                        <div className="absolute w-full h-px bg-orange-50" />

                        <button
                          onClick={() => toggleExpand(topic.id)}
                          className="relative z-10 rounded-full flex items-center gap-2 px-3 py-2 text-orange-500 bg-orange-50 body-extra-small-bold"
                          type="button"
                        >
                          <TbChevronsDown size={16} />
                          <span>{t('words.viewAll')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
        </div>
      ) : (
        <div className="mt-6">
          {filteredCourses.length === 0 ? (
            <EmptyState
              title={t('courses.noCoursesFound')}
              description={t('courses.tryAdjustingFilters')}
              actionButton={{
                onClick: () => {
                  resetFilters();
                },
                label: t('words.resetFilters'),
              }}
              icon={TbBooksOff}
            />
          ) : (
            <div className="flex flex-wrap gap-2 md:gap-4">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} mode="light" />
              ))}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
