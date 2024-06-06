import { Link } from '@tanstack/react-router';
import { capitalize } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedCourse } from '@sovereign-university/types';
import { Button, cn } from '@sovereign-university/ui';

import { PageLayout } from '#src/components/PageLayout/index.js';
// import { CourseCard } from '../../../components/course-card.tsx';
// import { fakeCourseId } from '../../../utils/courses.ts';
// import { extractNumbers } from '../../../utils/string.ts';
// import type { TRPCRouterOutput } from '../../../utils/trpc.ts';
import { DropdownMenu } from '#src/features/resources/components/DropdownMenu/dropdown-menu.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';

import { trpc } from '../../../utils/trpc.ts';
// import type { Course } from '../components/course-tree.tsx';
// import { CourseTree } from '../components/course-tree.tsx';
// import { LevelPicker } from '../components/level-picker.tsx';
// import { TopicPicker } from '../components/topic-picker.tsx';

interface CourseInfoItemProps {
  leftText: string;
  rightText: string;
}

const levels = ['beginner', 'intermediate', 'advanced', 'developer'];

const sortCoursesByLevel = (courses: JoinedCourse[]) => {
  return courses.sort((a, b) => {
    return levels.indexOf(a.level) - levels.indexOf(b.level);
  });
};

const CourseInfoItem = ({ leftText, rightText }: CourseInfoItemProps) => {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-2">
      <span className="text-white/70 leading-relaxed tracking-[0.08px]">
        {leftText}
      </span>
      <span className="font-medium leading-relaxed tracking-[0.08px]">
        {rightText}
      </span>
    </div>
  );
};

const CourseSelector = ({ courses }: { courses: JoinedCourse[] }) => {
  const { t } = useTranslation();

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
      <section className="flex bg-darkOrange-10 border border-darkOrange-5 rounded-2xl px-6 py-8 gap-10 max-md:hidden w-full max-w-[1060px] mx-auto">
        <div className="flex flex-col gap-6 basis-56">
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
        <div className="flex flex-col gap-2.5 flex-basis-64 shrink-[2]">
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
        <div className="flex flex-col gap-4 basis-[448px]">
          <h3 className="text-darkOrange-5 leading-normal">
            {t('words.description')}
          </h3>
          {activeCourse && (
            <article className="flex flex-col">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="desktop-h8 text-newGray-5 capitalize">
                  {activeCourse.topic}
                </span>
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

              <div className="flex flex-col border-t border-white/10 mb-8">
                {/* fix professor output issue */}
                {/* <CourseInfoItem
                  leftText={t('words.professor')}
                  rightText={activeCourse.professors
                    .map((professor) => professor.name)
                    .join(', ')}
                /> */}
                <CourseInfoItem
                  leftText={t('words.level.level')}
                  rightText={t(`words.level.${activeCourse.level}`)}
                />
                <CourseInfoItem
                  leftText={t('words.duration')}
                  rightText={activeCourse.hours + ' hours'}
                />
                <CourseInfoItem
                  leftText={t('words.price')}
                  rightText={
                    activeCourse.paidPriceDollars
                      ? `${activeCourse.paidPriceDollars}$`
                      : t('words.free')
                  }
                />
                <CourseInfoItem
                  leftText={t('words.courseId')}
                  rightText={activeCourse.id.toUpperCase()}
                />
              </div>

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
        <span className="">Select a topic</span>
        <div className="max-w-60 w-full">
          <DropdownMenu
            activeItem={capitalize(activeTopic)}
            itemsList={topics
              .map((topic) => ({
                name: capitalize(topic),
                onClick: () => setActiveTopic(topic),
              }))
              .filter((topic) => topic.name.toLowerCase() !== activeTopic)}
          />
        </div>
        <div className="flex flex-col gap-4">
          {levels.map((level) => (
            <div key={level} className="flex flex-col gap-5">
              <h4 className="text-xl leading-normal font-medium text-darkOrange-5 ">
                {t(`words.level.${level}`) + ` ${t('words.courses')}`}
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
        </div>
      </section>
    </>
  );
};

export const CoursesExplorer = () => {
  const { i18n, t } = useTranslation();
  const { data: courses } = trpc.content.getCourses.useQuery({
    language: i18n.language,
  });

  return (
    <PageLayout
      title={t('courses.explorer.pageTitle')}
      subtitle={t('courses.explorer.pageSubtitle')}
      description={t('courses.explorer.pageDescription')}
    >
      {courses && (
        <>
          <p className="mobile-h3 md:desktop-h6 max-w-[451px] text-center mx-auto mt-6 mb-5 md:mt-16 md:mb-10">
            {t('courses.explorer.findCourses')}
          </p>
          <CourseSelector courses={courses} />
        </>
      )}
    </PageLayout>
  );
};

// Old version with course tree

// export const CoursesExplorer = () => {
//   const { i18n, t } = useTranslation();
//   const { data: courses } = trpc.content.getCourses.useQuery({
//     language: i18n.language,
//   });
//   const [activeCategories, setActiveCategories] = useState<string[]>([]);
//   const [activeLevels, setActiveLevels] = useState<string[]>([]);

//   const categories = [
//     {
//       prefix: 'btc',
//       topic: t('courses.categories.btc'),
//     },
//     {
//       prefix: 'ln',
//       topic: t('courses.categories.ln'),
//     },
//     {
//       prefix: 'econ',
//       topic: t('courses.categories.econ'),
//     },
//     {
//       prefix: 'secu',
//       topic: t('courses.categories.secu'),
//     },
//     {
//       prefix: 'fin',
//       topic: t('courses.categories.fin'),
//     },
//     {
//       prefix: 'crypto',
//       topic: t('courses.categories.crypto'),
//     },
//     {
//       prefix: 'min',
//       topic: t('courses.categories.min'),
//     },
//   ];

//   const levels = [
//     {
//       prefix: '100',
//       name: 'beginner',
//       translatedName: t('words.level.beginner'),
//     },
//     {
//       prefix: '200',
//       name: 'intermediate',
//       translatedName: t('words.level.intermediate'),
//     },
//     {
//       prefix: '300',
//       name: 'advanced',
//       translatedName: t('words.level.advanced'),
//     },
//     {
//       prefix: '400',
//       name: 'developer',
//       translatedName: t('words.level.developer'),
//     },
//   ];

//   const treeCourses = convertCoursesToTree(courses || []);

//   function convertCoursesToTree(
//     courses: Array<
//       NonNullable<TRPCRouterOutput['content']['getCourses']>[number]
//     >,
//   ) {
//     const treeCourses: Course[] = [];

//     // First year
//     const firstYearCourses = courses
//       .filter(
//         (c) =>
//           (Number(extractNumbers(c.id)) >= 100 &&
//             Number(extractNumbers(c.id)) < 200) ||
//           c.id === 'bizschool',
//       )
//       .sort((a, b) =>
//         extractNumbers(fakeCourseId(a.id)).localeCompare(
//           extractNumbers(fakeCourseId(b.id)),
//         ),
//       );

//     let previousElement: Course | undefined;

//     for (const course of firstYearCourses) {
//       const treeCourse: Course = {
//         id: course.id,
//         language: course.language,
//         level: course.level,
//         name: course.name,
//         unreleased: false,
//         children: [],
//       };

//       if (previousElement) {
//         previousElement.children?.push(treeCourse);
//       } else {
//         treeCourses.push(treeCourse);
//       }

//       previousElement = treeCourse;
//     }

//     // Second year
//     let previousCategory = '';

//     let secondYearCourses = courses.filter(
//       (c) =>
//         Number(extractNumbers(c.id)) >= 200 ||
//         c.id === 'cuboplus' ||
//         c.id === 'rgb',
//     );

//     secondYearCourses = secondYearCourses.sort((a, b) =>
//       fakeCourseId(a.id).localeCompare(fakeCourseId(b.id)),
//     );

//     for (const course of secondYearCourses) {
//       const treeCourse: Course = {
//         id: course.id,
//         language: course.language,
//         level: course.level,
//         name: course.name,
//         unreleased: false,
//         children: [],
//       };

//       const courseCategory = fakeCourseId(course.id).replaceAll(/\d/g, '');

//       if (courseCategory === previousCategory) {
//         previousElement?.children?.push(treeCourse);
//       } else {
//         treeCourse.groupName = convertCategoryToName(
//           course.id.replaceAll(/\d/g, ''),
//         );
//         treeCourses.push(treeCourse);
//       }

//       previousElement = treeCourse;
//       previousCategory = courseCategory;
//     }

//     return treeCourses;
//   }

//   function convertCategoryToName(category: string): string {
//     switch (category) {
//       case 'econ': {
//         return t('words.economy');
//       }
//       case 'ln': {
//         return 'LN';
//       }
//       default: {
//         return t('courses.categories.' + category);
//       }
//     }
//   }

//   function handleSetActiveCategories(category: string) {
//     const newActiveCategories = [...activeCategories];
//     if (newActiveCategories.includes(category)) {
//       const categoryIndex = newActiveCategories.indexOf(category);
//       newActiveCategories.splice(categoryIndex, 1);
//     } else {
//       newActiveCategories.push(category);
//     }
//     setActiveCategories(newActiveCategories);
//   }

//   function handleSetActiveLevels(level: string) {
//     const newActiveLevels = [...activeLevels];
//     if (newActiveLevels.includes(level)) {
//       const categoryIndex = newActiveLevels.indexOf(level);
//       newActiveLevels.splice(categoryIndex, 1);
//     } else {
//       newActiveLevels.push(level);
//     }
//     setActiveLevels(newActiveLevels);
//   }

//   return (
//     <PageLayout
//       title={t('courses.explorer.pageTitle')}
//       subtitle={t('courses.explorer.pageSubtitle')}
//       description={t('courses.explorer.pageDescription')}
//       paddingXClasses="px-0"
//     >
//       <div className="bg-black flex w-full flex-col items-center justify-center">
//         <div className="my-6 w-full max-w-6xl px-1 sm:px-4 xl:my-12">
//           <CourseTree courses={treeCourses} />
//         </div>
//         <div className="flex max-w-6xl flex-col items-center justify-center  text-white">
//           <div className="mb-4 hidden w-full flex-col px-8 sm:flex">
//             <h3 className="font-semibold sm:text-2xl">
//               {t('courses.explorer.s2t1')}
//             </h3>
//             <div className="flex flex-col justify-between space-y-5 text-base font-light">
//               <span>{t('courses.explorer.s2p1')}</span>
//               <span>{t('courses.explorer.s2p2')}</span>
//               <span>{t('courses.explorer.s2p3')}</span>
//             </div>
//             <h3 className="mt-12 text-xl font-semibold">
//               {t('courses.explorer.s3t1')}
//             </h3>
//           </div>

//           <div className="mb-4 flex w-full flex-col px-3 sm:mb-16 sm:px-8">
//             <div className="px-5 text-base sm:rounded-3xl sm:border-2 sm:border-white sm:bg-blue-900 ">
//               <div className="flex flex-col">
//                 <div className="flex flex-col sm:flex-row xl:gap-12">
//                   <span className="mt-4 whitespace-nowrap font-semibold text-orange-500 sm:text-white">
//                     {t('courses.explorer.s3PickTopic')}
//                   </span>
//                   <TopicPicker
//                     categories={categories}
//                     activeCategories={activeCategories}
//                     setActiveCategories={handleSetActiveCategories}
//                   />
//                 </div>
//                 <div className="flex flex-col gap-0 sm:flex-row sm:gap-6 xl:gap-12">
//                   <span className="mt-6 whitespace-nowrap font-semibold text-orange-500 sm:text-white">
//                     {t('courses.explorer.s3PickLevel')}
//                   </span>
//                   <div className="my-0 sm:my-4">
//                     <LevelPicker
//                       levels={levels}
//                       activelevels={activeLevels}
//                       setActivelevels={handleSetActiveLevels}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 px-5 md:grid-cols-3 lg:max-w-6xl lg:grid-cols-4">
//           {courses?.map((course) => (
//             <CourseCard
//               course={course}
//               key={course.id}
//               selected={
//                 (activeCategories.length === 0 ||
//                   activeCategories.some((category) =>
//                     course.id.toLowerCase().startsWith(category.toLowerCase()),
//                   )) &&
//                 (activeLevels.length === 0 ||
//                   activeLevels.some(
//                     (lev) => course.level.toLowerCase() === lev.toLowerCase(),
//                   ))
//               }
//             />
//           ))}
//         </div>
//       </div>
//     </PageLayout>
//   );
// };
