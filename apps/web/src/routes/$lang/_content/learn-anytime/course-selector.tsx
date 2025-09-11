import type { JoinedCourse } from '@blms/types';
import {
  Button,
  ButtonWithArrow,
  cn,
  DropdownMenu,
  Image,
  Loader,
} from '@blms/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { TbChevronRight } from 'react-icons/tb';
import { PageLayout } from '#src/components/page-layout.js';
import { AppContext } from '#src/providers/context.tsx';
import { assetUrl } from '#src/utils/index.ts';
import { formatNameForURL, normalizeString } from '#src/utils/string.ts';
import { CourseInfoSection } from './-components/course-info-section.tsx';
import { levels, sortCoursesByLevel } from './-utils/course-utils.tsx';

export const Route = createFileRoute(
  '/$lang/_content/learn-anytime/course-selector',
)({
  component: CourseSelector,
});

function CourseSelector() {
  const { courses } = useContext(AppContext);
  const { i18n } = useTranslation();

  const selectedSchool = null;

  const filteredCourses = courses
    ? courses
        .filter(
          (course) =>
            course.isArchived === false &&
            normalizeString(course.language) ===
              normalizeString(i18n.language) &&
            course.teachingFormat === 'self_paced' &&
            (!course.paymentExpirationDate ||
              course.paymentExpirationDate > new Date()),
        )
        .sort((a, b) => a.index.slice(3).localeCompare(b.index.slice(3)))
        .sort((a, b) =>
          a.index === selectedSchool ? -1 : b.index === selectedSchool ? 1 : 0,
        )
    : [];

  const [topics, setTopics] = useState<string[]>([]);
  const [activeTopic, setActiveTopic] = useState('bitcoin');

  const [topicCourses, setTopicCourses] = useState<JoinedCourse[] | []>([]);

  const [activeCourse, setActiveCourse] = useState<JoinedCourse | null>(null);

  useEffect(() => {
    if (filteredCourses) {
      setTopics(
        [...new Set(filteredCourses.map((course) => course.topic))].sort(),
      );
      setTopicCourses(
        filteredCourses.filter((course) => course.topic === activeTopic),
      );
    }
  }, [courses, activeTopic]);

  useEffect(() => {
    setActiveCourse(sortCoursesByLevel(topicCourses)[0]);
  }, [activeTopic, topicCourses]);

  if (!courses) {
    return null;
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
    >
      {!filteredCourses && <Loader size={'s'} />}

      {/* Desktop */}
      <section className="flex px-6 py-8 gap-4 max-lg:hidden w-full mx-auto">
        {/* First column */}
        <nav className="flex flex-col w-full max-w-52 shrink-1 gap-2.5">
          {topics?.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => {
                setActiveTopic(topic);
                activeTopic !== topic && setActiveCourse(null);
              }}
              className={cn(
                'flex items-center justify-between text-black text-lg leading-snug w-full py-2 px-3 uppercase text-start rounded-md',
                activeTopic === topic
                  ? 'bg-neutral-100 font-medium'
                  : 'hover:bg-neutral-50',
              )}
            >
              {topic}
              <TbChevronRight
                className={cn(
                  activeTopic === topic
                    ? 'text-neutral-400'
                    : 'text-neutral-200',
                )}
              />
            </button>
          ))}
        </nav>
        <div className="w-px self-stretch bg-neutral-50 shrink-0" />
        {/* Middle column */}
        <div className="flex flex-col gap-2.5 w-full max-w-[280px] shrink-1">
          <nav className="flex flex-col gap-8">
            {levels.map((level) => (
              <div key={level} className="flex flex-col gap-1">
                <h4 className="uppercase subtitle-small text-orange-500 w-60 px-4 py-1">
                  {t(`words.level.${level}`)}
                </h4>
                <div className="flex flex-col gap-2.5">
                  {topicCourses
                    ?.filter((course) => course.level === level)
                    .map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => setActiveCourse(course)}
                        className={cn(
                          'text-black text-lg leading-snug w-full py-2 px-3 text-start rounded-md',
                          activeCourse?.id === course.id
                            ? 'bg-neutral-100 font-medium'
                            : 'hover:bg-neutral-50',
                        )}
                      >
                        {course.name}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
        <div className="w-px self-stretch bg-neutral-50 shrink-0" />
        {/* Last column */}
        <div className="flex flex-col gap-4 w-full max-w-[448px] shrink-1">
          {activeCourse && (
            <article className="flex flex-col">
              <h4 className="desktop-h4 text-black mb-6">
                {activeCourse.name}
              </h4>

              <Image
                src={assetUrl(
                  `courses/${activeCourse.index}`,
                  'thumbnail.webp',
                )}
                alt={activeCourse.name}
                className="rounded-md mb-6"
                breakpoints={{ default: 512 }}
              />

              <span className="text-justify leading-normal tracking-015px text-neutral-500 whitespace-break-spaces mb-5">
                {activeCourse.goal}
              </span>

              <CourseInfoSection course={activeCourse} />

              <ButtonWithArrow
                variant="primary"
                size="l"
                className="w-full"
                asChild
              >
                <Link
                  to={`/courses/${formatNameForURL(activeCourse.name)}-${activeCourse.id}`}
                >
                  {t('courses.explorer.seeCourse')}
                </Link>
              </ButtonWithArrow>
            </article>
          )}
        </div>
      </section>

      {/* Mobile */}
      <section className="lg:hidden flex flex-col max-w-lg mx-auto">
        <h1 className="display-base text-black mb-5">
          {t('courses.courseSelector')}
        </h1>
        <span className="label-strong text-neutral-800 mb-1">
          {t('courses.selectATopic')}
        </span>
        <div className="w-full mb-6">
          <DropdownMenu
            activeItem={capitalize(activeTopic)}
            itemsList={topics
              .map((topic) => ({
                name: capitalize(topic),
                onClick: () => setActiveTopic(topic),
              }))
              .filter((topic) => topic.name.toLowerCase() !== activeTopic)}
            className="lg:hidden"
            variant="light"
          />
        </div>
        <div className="flex flex-col gap-6">
          {levels.map((level) => (
            <div key={level} className="flex flex-col gap-1">
              <h4 className="body-small-bold text-neutral-800">
                {t(`words.level.${level}`)}
              </h4>
              <div className="flex flex-col gap-1">
                {topicCourses
                  ?.filter((course) => course.level === level)
                  .map((course) => (
                    <details
                      key={course.id}
                      className="group w-full py-3 px-2 text-start rounded-lg bg-neutral-50"
                    >
                      <summary className="flex items-center justify-between hover:cursor-pointer">
                        <span className="truncate body-extra-small text-black">
                          {course.name}
                        </span>
                        <MdKeyboardArrowDown
                          className={cn(
                            'size-6 transition-transform ease-in-out rotate-0 group-open:-rotate-180 text-neutral-400',
                          )}
                        />
                      </summary>
                      <article className="flex flex-col gap-4 mt-2.5">
                        <img
                          src={assetUrl(
                            `courses/${course.index}`,
                            'thumbnail.webp',
                          )}
                          alt={course.name}
                          className="rounded-md"
                        />
                        <CourseInfoSection course={course} />
                        <Link
                          to={`/courses/${formatNameForURL(course.name)}-${course.id}`}
                        >
                          <Button variant="primary" size="m" className="w-full">
                            {t('courses.explorer.discover')}
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
    </PageLayout>
  );
}
