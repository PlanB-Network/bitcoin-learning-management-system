import type { JoinedCourse } from '@blms/types';
import { Button, cn, DropdownMenu, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { capitalize } from 'lodash-es';
import { useEffect, useState } from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { assetUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { levels, sortCoursesByLevel } from '../-utils/course-utils.tsx';
import { CourseInfoSection } from './course-info-section.tsx';

export const CourseSelector = ({ courses }: { courses: JoinedCourse[] }) => {
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
            {topics?.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  setActiveTopic(topic);
                  activeTopic !== topic && setActiveCourse(null);
                }}
                className={cn(
                  'text-lg leading-snug font-medium w-full py-2 px-4  uppercase text-start rounded-md',
                  activeTopic === topic
                    ? 'bg-darkOrange-7'
                    : 'hover:bg-darkOrange-9',
                )}
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
                  {filteredCourses
                    ?.filter((course) => course.level === level)
                    .map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => setActiveCourse(course)}
                        className={cn(
                          'text-lg leading-snug font-medium w-full py-2 px-4 text-start rounded-md',
                          activeCourse?.id === course.id
                            ? 'bg-darkOrange-7'
                            : 'hover:bg-darkOrange-9',
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
                  <span className="bg-white/20 rounded-xs p-1 text-xs leading-none uppercase">
                    {activeCourse.index === 'btc101'
                      ? t('words.start')
                      : t(`words.level.${activeCourse.level}`)}
                  </span>
                  <span className="bg-white/20 rounded-xs p-1 text-xs leading-none uppercase">
                    {activeCourse.requiresPayment
                      ? t('courses.details.paidCourse')
                      : t('words.free')}
                  </span>
                </div>
              </div>

              <h4 className="desktop-h4 mb-6">{activeCourse.name}</h4>

              <Image
                src={assetUrl(
                  `courses/${activeCourse.index}`,
                  'thumbnail.webp',
                )}
                alt={activeCourse.name}
                className="rounded-md mb-6"
                breakpoints={{ default: 512 }}
              />

              <span className="text-justify leading-normal tracking-015px text-newGray-6 whitespace-break-spaces mb-5">
                {activeCourse.goal}
              </span>

              <CourseInfoSection course={activeCourse} />

              <Link
                to={`/courses/${formatNameForURL(activeCourse.name)}-${activeCourse.id}`}
              >
                <Button variant="primary" size="l" className="w-full">
                  {t('courses.explorer.seeCourse')}
                  <FaArrowRightLong
                    className={cn(
                      'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                      'group-hover:ml-3',
                    )}
                  />
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
            className="lg:hidden"
          />
        </div>
        <div className="flex flex-col gap-4">
          {levels.map((level) => (
            <div key={level} className="flex flex-col gap-5">
              <h4 className="leading-normal font-medium text-darkOrange-5 ">
                {`${t(`words.level.${level}`)} - ${t('words.courses')}`}
              </h4>
              <div className="flex flex-col gap-2.5">
                {filteredCourses
                  ?.filter((course) => course.level === level)
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
                            {t('courses.explorer.seeCourse')}
                            <FaArrowRightLong
                              className={cn(
                                'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                                'group-hover:ml-3',
                              )}
                            />
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
