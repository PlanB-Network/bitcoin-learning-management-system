import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CourseCard } from '../../../components/course-card';
import { MainLayout } from '../../../components/MainLayout';
import {
  PageDescription,
  PageHeader,
  PageSubtitle,
  PageTitle,
} from '../../../components/PageHeader';
import { fakeCourseId } from '../../../utils/courses';
import { extractNumbers } from '../../../utils/string';
import { TRPCRouterOutput, trpc } from '../../../utils/trpc';
import { Course, CourseTree } from '../components/courseTree';
import { LevelPicker } from '../components/level-picker';
import { TopicPicker } from '../components/topic-picker';

export const CoursesExplorer = () => {
  const { i18n, t } = useTranslation();
  const { data: courses } = trpc.content.getCourses.useQuery({
    language: i18n.language,
  });
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeLevels, setActiveLevels] = useState<string[]>([]);

  const categories = [
    {
      prefix: 'btc',
      topic: t('courses.categories.btc'),
    },
    {
      prefix: 'ln',
      topic: t('courses.categories.ln'),
    },
    {
      prefix: 'econ',
      topic: t('courses.categories.econ'),
    },
    {
      prefix: 'secu',
      topic: t('courses.categories.secu'),
    },
    {
      prefix: 'fin',
      topic: t('courses.categories.fin'),
    },
    {
      prefix: 'crypto',
      topic: t('courses.categories.crypto'),
    },
    {
      prefix: 'min',
      topic: t('courses.categories.min'),
    },
  ];

  const levels = [
    {
      prefix: '100',
      name: 'beginner',
      translatedName: t('words.level.beginner'),
    },
    {
      prefix: '200',
      name: 'intermediate',
      translatedName: t('words.level.intermediate'),
    },
    {
      prefix: '300',
      name: 'advanced',
      translatedName: t('words.level.advanced'),
    },
    {
      prefix: '400',
      name: 'developer',
      translatedName: t('words.level.developer'),
    },
  ];

  const treeCourses = convertCoursesToTree(courses || []);

  function convertCoursesToTree(
    courses: NonNullable<TRPCRouterOutput['content']['getCourses']>[number][],
  ) {
    const treeCourses: Course[] = [];

    // First year
    const firstYearCourses = courses
      .filter(
        (c) =>
          Number(extractNumbers(c.id)) >= 100 &&
          Number(extractNumbers(c.id)) < 200,
      )
      .sort((a, b) => extractNumbers(a.id).localeCompare(extractNumbers(b.id)));

    let previousElement: Course;

    firstYearCourses.forEach((course) => {
      const treeCourse: Course = {
        id: course.id,
        language: course.language,
        level: course.level,
        name: course.name,
        unreleased: false,
        children: [],
      };

      if (previousElement) {
        previousElement.children?.push(treeCourse);
      } else {
        treeCourses.push(treeCourse);
      }
      previousElement = treeCourse;
    });

    // Second year
    let previousCategory = '';

    let secondYearCourses = courses.filter(
      (c) => Number(extractNumbers(c.id)) >= 200 || c.id === 'cuboplus',
    );

    secondYearCourses = secondYearCourses.sort((a, b) =>
      fakeCourseId(a.id).localeCompare(fakeCourseId(b.id)),
    );

    secondYearCourses.forEach((course) => {
      const treeCourse: Course = {
        id: course.id,
        language: course.language,
        level: course.level,
        name: course.name,
        unreleased: false,
        children: [],
      };

      const courseCategory = fakeCourseId(course.id).replace(/[0-9]/g, '');
      if (courseCategory === previousCategory) {
        previousElement.children?.push(treeCourse);
      } else {
        treeCourse.groupName = convertCategoryToName(
          course.id.replace(/[0-9]/g, ''),
        );
        treeCourses.push(treeCourse);
      }

      previousElement = treeCourse;
      previousCategory = courseCategory;
    });

    return treeCourses;
  }

  function convertCategoryToName(category: string): string {
    switch (category) {
      case 'econ':
        return t('words.economy');
      case 'ln':
        return 'LN';
      default:
        return t('courses.categories.' + category);
    }
  }

  function handleSetActiveCategories(category: string) {
    const newActiveCategories = [...activeCategories];
    if (newActiveCategories.includes(category)) {
      const categoryIndex = newActiveCategories.indexOf(category);
      newActiveCategories.splice(categoryIndex, 1);
    } else {
      newActiveCategories.push(category);
    }
    setActiveCategories(newActiveCategories);
  }

  function handleSetActiveLevels(level: string) {
    const newActiveLevels = [...activeLevels];
    if (newActiveLevels.includes(level)) {
      const categoryIndex = newActiveLevels.indexOf(level);
      newActiveLevels.splice(categoryIndex, 1);
    } else {
      newActiveLevels.push(level);
    }
    setActiveLevels(newActiveLevels);
  }

  return (
    <MainLayout footerVariant="dark">
      <div className="bg-blue-1000 flex w-full flex-col items-center justify-center">
        <PageHeader>
          <PageTitle>{t('courses.explorer.pageTitle')}</PageTitle>
          <PageSubtitle>{t('courses.explorer.pageSubtitle')}</PageSubtitle>
          <PageDescription>
            {t('courses.explorer.pageDescription')}
          </PageDescription>
        </PageHeader>

        <div className="my-6 w-full max-w-6xl px-1 sm:px-4 xl:my-12">
          <CourseTree courses={treeCourses} />
        </div>
        <div className="flex max-w-6xl flex-col items-center justify-center  text-white">
          <div className="mb-4 hidden w-full flex-col px-8 sm:flex">
            <h3 className="font-semibold sm:text-2xl">
              {t('courses.explorer.s2t1')}
            </h3>
            <div className="flex flex-col justify-between space-y-5 text-base font-light">
              <span>{t('courses.explorer.s2p1')}</span>
              <span>{t('courses.explorer.s2p2')}</span>
              <span>{t('courses.explorer.s2p3')}</span>
            </div>
            <h3 className="mt-12 text-xl font-semibold">
              {t('courses.explorer.s3t1')}
            </h3>
          </div>

          <div className="mb-4 flex w-full flex-col px-3 sm:mb-16 sm:px-8">
            <div className="px-5 text-base sm:rounded-3xl sm:border-2 sm:border-white sm:bg-blue-900 ">
              <div className="flex flex-col">
                <div className="flex flex-col sm:flex-row xl:gap-12">
                  <span className="mt-4 whitespace-nowrap font-semibold text-orange-500 sm:text-white">
                    {t('courses.explorer.s3PickTopic')}
                  </span>
                  <TopicPicker
                    categories={categories}
                    activeCategories={activeCategories}
                    setActiveCategories={handleSetActiveCategories}
                  />
                </div>
                <div className="flex flex-col gap-0 sm:flex-row sm:gap-6 xl:gap-12">
                  <span className="mt-6 whitespace-nowrap font-semibold text-orange-500 sm:text-white">
                    {t('courses.explorer.s3PickLevel')}
                  </span>
                  <div className="my-0 sm:my-4">
                    <LevelPicker
                      levels={levels}
                      activelevels={activeLevels}
                      setActivelevels={handleSetActiveLevels}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 px-5 md:grid-cols-3 lg:max-w-6xl lg:grid-cols-4">
          {courses?.map((course) => (
            <CourseCard
              course={course}
              key={course.id}
              selected={
                (activeCategories.length === 0 ||
                  activeCategories.some((category) =>
                    course.id.toLowerCase().startsWith(category.toLowerCase()),
                  )) &&
                (activeLevels.length === 0 ||
                  activeLevels.some(
                    (lev) => course.level.toLowerCase() === lev.toLowerCase(),
                  ))
              }
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
