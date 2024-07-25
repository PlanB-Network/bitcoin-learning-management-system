import { Link, createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';

import type { JoinedCourse } from '@blms/types';
import { Button, cn } from '@blms/ui';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { BCertificatePresentation } from '#src/components/b-certificate-presentation.js';
import { PageLayout } from '#src/components/PageLayout/index.js';
import { computeAssetCdnUrl, trpc } from '#src/utils/index.js';

import { DropdownMenu } from '../resources/-components/DropdownMenu/dropdown-menu.tsx';

export const Route = createFileRoute('/_content/courses/')({
  component: CoursesExplorer,
});

interface CourseInfoItemProps {
  leftText: string;
  rightText: string;
  isMobileOnly?: boolean;
  isDesktopOnly?: boolean;
  className?: string;
}

const levels = ['beginner', 'intermediate', 'advanced', 'wizard'];

const sortCoursesByLevel = (courses: JoinedCourse[]) => {
  return courses.sort((a, b) => {
    return levels.indexOf(a.level) - levels.indexOf(b.level);
  });
};

const CourseInfoSection = ({ course }: { course: JoinedCourse }) => {
  return (
    <section className="flex flex-col md:border-t border-white/10 md:mb-8">
      <CourseInfoItem
        leftText={t('words.professor')}
        rightText={course.professors
          .map((professor) => professor.name)
          .join(', ')}
      />
      <CourseInfoItem
        leftText={t('words.level.level')}
        rightText={t(`words.level.${course.level}`)}
      />
      {/* no chaptersCount on course, to fix */}
      {/* <CourseInfoItem
        leftText={t('words.chapters')}
        rightText={course.chaptersCount ? `${course.chaptersCount}` : '/'}
        isMobileOnly
      /> */}
      <CourseInfoItem
        leftText={t('words.duration')}
        rightText={course.hours + ' hours'}
      />
      <CourseInfoItem
        leftText={t('words.price')}
        rightText={
          course.paidPriceDollars
            ? `${course.paidPriceDollars}$`
            : t('words.free')
        }
      />
      <CourseInfoItem
        leftText={t('words.courseId')}
        rightText={course.id.toUpperCase()}
        isDesktopOnly
      />
    </section>
  );
};

const CourseInfoItem = ({
  leftText,
  rightText,
  isMobileOnly,
  isDesktopOnly,
  className,
}: CourseInfoItemProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b border-white/10 py-2 gap-2',
        isMobileOnly && 'md:hidden',
        isDesktopOnly && 'max-md:hidden',
        className,
      )}
    >
      <span className="text-white/70 leading-relaxed tracking-[0.08px]">
        {leftText}
      </span>
      <span className="font-medium leading-relaxed tracking-[0.08px] text-right">
        {rightText}
      </span>
    </div>
  );
};

export const CourseCard = ({ course }: { course: JoinedCourse }) => {
  return (
    <article className="group flex flex-col w-full md:h-[472px] bg-darkOrange-11 p-2.5 rounded-[20px] overflow-hidden">
      <img
        src={computeAssetCdnUrl(
          course.lastCommit,
          `courses/${course.id}/assets/thumbnail.webp`,
        )}
        alt={course.name}
        className="max-md:hidden rounded-md mb-2.5 object-cover [overflow-clip-margin:_unset] object-center max-h-72 group-hover:max-h-44 transition-[max-height] duration-300 ease-linear"
      />
      <div className="flex md:flex-col max-md:gap-2.5 max-md:mb-2.5 md:mb-2">
        <img
          src={computeAssetCdnUrl(
            course.lastCommit,
            `courses/${course.id}/assets/thumbnail.webp`,
          )}
          alt={course.name}
          className="md:hidden rounded-md w-[124px] object-cover [overflow-clip-margin:_unset] object-center"
        />
        <div className="flex flex-col">
          <span className="max-md:flex flex-col justify-center mb-1.5 md:mb-2 line-clamp-3 group-hover:line-clamp-2 font-medium leading-[120%] tracking-015px md:desktop-h6 text-darkOrange-5 max-md:h-full">
            {course.name}
          </span>
          <div className="flex items-center flex-wrap gap-1.5 md:gap-2 mt-auto">
            <span className="bg-white/20 rounded-sm p-1 text-xs leading-none uppercase">
              {course.id === 'btc101'
                ? t('words.start')
                : t(`words.level.${course.level}`)}
            </span>
            <span className="bg-white/20 rounded-sm p-1 text-xs leading-none uppercase">
              {course.requiresPayment ? t('words.paid') : t('words.free')}
            </span>
          </div>
        </div>
      </div>
      <div className="relative">
        <p className="text-white/70 md:leading-relaxed md:tracking-[0.08px] line-clamp-3 md:line-clamp-4 transition-opacity opacity-100 md:group-hover:opacity-0 md:group-hover:absolute duration-300">
          {course.goal}
        </p>
      </div>
      <div className="max-md:hidden relative">
        <div className="flex flex-col transition-opacity opacity-0 md:group-hover:opacity-100 absolute md:group-hover:static duration-0 md:group-hover:duration-150">
          <span className="font-medium leading-normal tracking-015px mb-2 line-clamp-1">
            {t('words.professor')} :{' '}
            {course.professors.map((professor) => professor.name).join(', ')}
          </span>
          <CourseInfoItem
            leftText={t('words.duration')}
            rightText={course.hours + ' hours'}
            className="border-t"
          />
          <CourseInfoItem
            leftText={t('words.price')}
            rightText={
              course.paidPriceDollars
                ? `${course.paidPriceDollars}$`
                : t('words.free')
            }
            className="border-none"
          />
        </div>
      </div>
      <div className="max-md:hidden relative mt-auto">
        <Button
          variant="newPrimary"
          size="m"
          onHoverArrow
          className="w-full absolute md:group-hover:static transition-opacity opacity-0 md:group-hover:opacity-100 duration-0 md:group-hover:duration-300"
        >
          {t('courses.explorer.seeCourse')}
        </Button>
      </div>
    </article>
  );
};

const CourseSelector = ({ courses }: { courses: JoinedCourse[] }) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [activeTopic, setActiveTopic] = useState('bitcoin');

  const [filteredCourses, setFilteredCourses] = useState<JoinedCourse[] | []>(
    [],
  );

  const [activeCourse, setActiveCourse] = useState<JoinedCourse | null>(null);

  useEffect(() => {
    if (courses) {
      setTopics([...new Set(courses.map((course) => course.topic))].sort());
      setFilteredCourses(
        courses.filter((course) => course.topic === activeTopic),
      );
    }
  }, [courses, activeTopic]);

  useEffect(() => {
    setActiveCourse(sortCoursesByLevel(filteredCourses)[0]);
  }, [activeTopic, filteredCourses]);

  return (
    <>
      {/* Desktop */}
      <section className="flex bg-darkOrange-10 border border-darkOrange-5 rounded-2xl px-6 py-8 gap-10 max-md:hidden w-full max-w-[1060px] mx-auto">
        {/* First column */}
        <div className="flex flex-col gap-6 w-full max-w-52 shrink-1">
          <h3 className="text-darkOrange-5 leading-normal">
            {t('words.topics')}
          </h3>
          <nav className="flex flex-col gap-2.5">
            {topics &&
              topics.map((topic) => (
                <button
                  key={topic}
                  className={cn(
                    'text-lg leading-snug font-medium w-full py-2 px-4  uppercase text-start rounded-md',
                    activeTopic === topic
                      ? 'bg-darkOrange-7'
                      : 'hover:bg-darkOrange-9',
                  )}
                  onClick={() => {
                    setActiveTopic(topic);
                    activeTopic !== topic && setActiveCourse(null);
                  }}
                >
                  {topic}
                </button>
              ))}
          </nav>
        </div>
        {/* Middle column */}
        <div className="flex flex-col gap-2.5 w-full max-w-[280px] shrink-1">
          <h3 className="text-darkOrange-5 leading-normal">
            {t('words.courses')}
          </h3>
          <nav className="flex flex-col gap-5">
            {levels.map((level) => (
              <div key={level} className="flex flex-col gap-5">
                <h4 className="uppercase text-xl leading-[120%] text-darkOrange-5 w-60 border-b border-darkOrange-7 px-4 py-2.5">
                  {t(`words.level.${level}`)}
                </h4>
                <div className="flex flex-col gap-2.5">
                  {filteredCourses &&
                    filteredCourses
                      .filter((course) => course.level === level)
                      .map((course) => (
                        <button
                          key={course.id}
                          className={cn(
                            'text-lg leading-snug font-medium w-full py-2 px-4 text-start rounded-md',
                            activeCourse?.id === course.id
                              ? 'bg-darkOrange-7'
                              : 'hover:bg-darkOrange-9',
                          )}
                          onClick={() => setActiveCourse(course)}
                        >
                          {course.name}
                        </button>
                      ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
        {/* Last column */}
        <div className="flex flex-col gap-4 w-full max-w-[448px] shrink-1">
          <h3 className="text-darkOrange-5 leading-normal">
            {t('words.description')}
          </h3>
          {activeCourse && (
            <article className="flex flex-col">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="desktop-h8 text-newGray-5 capitalize">
                  {activeCourse.topic}
                </span>
                <div className="flex items-center flex-wrap gap-2.5">
                  <span className="bg-white/20 rounded-sm p-1 text-xs leading-none uppercase">
                    {activeCourse.id === 'btc101'
                      ? t('words.start')
                      : t(`words.level.${activeCourse.level}`)}
                  </span>
                  <span className="bg-white/20 rounded-sm p-1 text-xs leading-none uppercase">
                    {activeCourse.requiresPayment
                      ? t('words.paid')
                      : t('words.free')}
                  </span>
                </div>
              </div>

              <h4 className="desktop-h4 mb-6">{activeCourse.name}</h4>

              <img
                src={computeAssetCdnUrl(
                  activeCourse.lastCommit,
                  `courses/${activeCourse.id}/assets/thumbnail.webp`,
                )}
                alt={activeCourse.name}
                className="rounded-md mb-6"
              />

              <span className="text-justify leading-normal tracking-015px text-newGray-6 whitespace-break-spaces mb-5">
                {activeCourse.goal}
              </span>

              <CourseInfoSection course={activeCourse} />

              <Link
                to="/courses/$courseId"
                params={{ courseId: activeCourse.id }}
              >
                <Button
                  variant="newPrimary"
                  size="l"
                  onHoverArrow
                  className="w-full"
                >
                  {t('courses.explorer.seeCourse')}
                </Button>
              </Link>
            </article>
          )}
        </div>
      </section>
      {/* Mobile */}
      <section className="md:hidden flex flex-col gap-4 border border-darkOrange-5 shadow-sm-section rounded-lg max-w-lg mx-auto p-2.5">
        <span className="leading-normal text-darkOrange-5">Select a topic</span>
        <div className="w-full">
          <DropdownMenu
            activeItem={capitalize(activeTopic)}
            itemsList={topics
              .map((topic) => ({
                name: capitalize(topic),
                onClick: () => setActiveTopic(topic),
              }))
              .filter((topic) => topic.name.toLowerCase() !== activeTopic)}
            maxWidth="max-w-full"
          />
        </div>
        <div className="flex flex-col gap-4">
          {levels.map((level) => (
            <div key={level} className="flex flex-col gap-5">
              <h4 className="leading-normal font-medium text-darkOrange-5 ">
                {t(`words.level.${level}`) + ` - ${t('words.courses')}`}
              </h4>
              <div className="flex flex-col gap-2.5">
                {filteredCourses &&
                  filteredCourses
                    .filter((course) => course.level === level)
                    .map((course) => (
                      <details
                        key={course.id}
                        className="group w-full p-2.5 text-start rounded-lg bg-darkOrange-10"
                      >
                        <summary className="py-1 flex justify-between hover:cursor-pointer">
                          <span className="truncate leading-snug">
                            {course.name}
                          </span>
                          <MdKeyboardArrowDown
                            className={cn(
                              'size-6 transition-transform ease-in-out rotate-0 group-open:-rotate-180',
                            )}
                          />
                        </summary>
                        <article className="flex flex-col gap-4 mt-2.5">
                          <img
                            src={computeAssetCdnUrl(
                              course.lastCommit,
                              `courses/${course.id}/assets/thumbnail.webp`,
                            )}
                            alt={course.name}
                            className="rounded-md"
                          />
                          <CourseInfoSection course={course} />
                          <Link
                            to="/courses/$courseId"
                            params={{ courseId: course.id }}
                          >
                            <Button
                              variant="newPrimary"
                              size="m"
                              onHoverArrow
                              className="w-full"
                            >
                              {t('courses.explorer.seeCourse')}
                            </Button>
                          </Link>
                        </article>
                      </details>
                    ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

const CoursesGallery = ({ courses }: { courses: JoinedCourse[] }) => {
  const topics = [...new Set(courses.map((course) => course.topic))].sort();

  const [filteredCourses, setFilteredCourses] = useState(courses);

  const [activeTopic, setActiveTopic] = useState('all');
  const [activeLevel, setActiveLevel] = useState('all');

  useEffect(() => {
    setFilteredCourses(
      courses
        .filter(
          (course) => activeTopic === 'all' || course.topic === activeTopic,
        )
        .filter(
          (course) => activeLevel === 'all' || course.level === activeLevel,
        ),
    );
  }, [courses, activeTopic, activeLevel]);

  return (
    <>
      <div className="flex flex-col gap-2 text-center mt-8 md:mt-20 max-md:px-1">
        <span className="text-darkOrange-5 mobile-h3 md:desktop-h7">
          {t('courses.explorer.journey')}
        </span>
        <h3 className="text-white mobile-h2 md:desktop-h4">
          {t('courses.explorer.exploreCourses')}
        </h3>
      </div>
      <div className="max-md:hidden mt-12">
        <p className="desktop-h6">{t('courses.explorer.buildPath')}</p>
        <div className="flex flex-col p-5 gap-8 bg-white/5 mt-5 rounded-[20px]">
          <div className="flex items-center gap-8">
            <p>{t('words.topics')}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTopic === 'all' ? 'newPrimary' : 'newTertiary'}
                size="s"
                onClick={() => setActiveTopic('all')}
              >
                {t('words.all')}
              </Button>
              {topics.map((topic) => (
                <Button
                  key={topic}
                  variant={activeTopic === topic ? 'newPrimary' : 'newTertiary'}
                  size="s"
                  onClick={() => setActiveTopic(topic)}
                  className="capitalize"
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <p>{t('words.level.levels')}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeLevel === 'all' ? 'newPrimary' : 'newTertiary'}
                size="s"
                onClick={() => setActiveLevel('all')}
              >
                {t('words.all')}
              </Button>
              {levels.map((level) => (
                <Button
                  key={level}
                  variant={activeLevel === level ? 'newPrimary' : 'newTertiary'}
                  size="s"
                  onClick={() => setActiveLevel(level)}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <section className="flex justify-center gap-5 md:gap-10 flex-wrap mt-8 md:mt-12">
        {filteredCourses.length > 0 &&
          filteredCourses.map((course) => (
            <Link
              key={course.id}
              to="/courses/$courseId"
              params={{ courseId: course.id }}
              className="flex w-full max-md:max-w-[500px] max-md:mx-auto md:w-[340px]"
            >
              <CourseCard course={course} />
            </Link>
          ))}
      </section>
    </>
  );
};

function CoursesExplorer() {
  const { i18n } = useTranslation();
  const { data: courses, isFetched } = trpc.content.getCourses.useQuery(
    {
      language: i18n.language,
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  return (
    <PageLayout
      title={t('courses.explorer.pageTitle')}
      subtitle={t('courses.explorer.pageSubtitle')}
      description={t('courses.explorer.pageDescription')}
      paddingXClasses="px-2.5 md:px-4"
      maxWidth="max-w-[1227px]"
    >
      {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}

      {courses && (
        <>
          <p className="mobile-h3 md:desktop-h6 max-w-[451px] text-center mx-auto mt-6 mb-5 md:mt-16 md:mb-10">
            {t('courses.explorer.findCourses')}
          </p>
          <CourseSelector courses={courses} />
        </>
      )}

      {courses && <CoursesGallery courses={courses} />}

      <BCertificatePresentation />
    </PageLayout>
  );
}
