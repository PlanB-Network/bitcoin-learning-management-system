import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MainLayout } from '../../../components/MainLayout';
import {
  PageDescription,
  PageHeader,
  PageSubtitle,
  PageTitle,
} from '../../../components/PageHeader';
import { trpc } from '../../../utils/trpc';
import { CoursePreview } from '../components/coursePreview';
import { LevelPicker } from '../components/level-picker';
import { Course, SolarSystem } from '../components/solarSystem';
import { TopicPicker } from '../components/topic-picker';

export const CoursesExplorer = () => {
  const { i18n, t } = useTranslation();
  const { data: courses } = trpc.content.getCourses.useQuery();
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeLevels, setActiveLevels] = useState<string[]>([]);

  const coursesInLanguage = courses?.filter(
    (course) => course.language === i18n.language,
  );

  // Hardcoded unreleased courses
  const unreleasedCourses: Course[] = [
    {
      id: 'fin101',
      name: t('courses.unreleased.financeIntroduction'),
      level: 'beginner',
      language: 'fr',
      unreleased: true,
    },
    {
      id: 'btc301',
      name: t('courses.unreleased.colcardAndSparrow'),
      level: 'advanced',
      language: 'fr',
      unreleased: true,
    },
    {
      id: 'ln301',
      name: t('courses.unreleased.theoreticalLightning'),
      level: 'advanced',
      language: 'fr',
      unreleased: true,
    },
    {
      id: 'fin205',
      name: t('courses.unreleased.financialCrisis'),
      level: 'intermediate',
      language: 'fr',
      unreleased: true,
    },
    {
      id: 'econ205',
      name: t('courses.unreleased.hyperinflation'),
      level: 'intermediate',
      language: 'fr',
      unreleased: true,
    },
  ];

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
      name: 'expert',
      translatedName: t('words.level.expert'),
    },
  ];

  const coursesWithUnreleased = [
    ...(coursesInLanguage || []),
    ...unreleasedCourses,
  ];

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
      <div className="flex w-full flex-col items-center justify-center bg-blue-900">
        <PageHeader>
          <PageTitle>{t('courses.explorer.pageTitle')}</PageTitle>
          <PageSubtitle>{t('courses.explorer.pageSubtitle')}</PageSubtitle>
          <PageDescription>
            {t('courses.explorer.pageDescription')}
          </PageDescription>
        </PageHeader>

        <div className="my-5 w-full">
          <SolarSystem courses={coursesWithUnreleased} />
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
            <div className="px-5 text-base sm:rounded-3xl sm:border-2 sm:border-white sm:bg-blue-800 ">
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

        <div className="grid grid-cols-1 px-5 sm:grid-cols-2 md:grid-cols-3 lg:max-w-6xl xl:grid-cols-4">
          {coursesInLanguage
            // ?.filter(({ id }) => {
            //   return (
            //     activeCategories.length === 0 ||
            //     activeCategories.some((category) =>
            //       id.toLowerCase().startsWith(category.toLowerCase()),
            //     )
            //   );
            // })
            // ?.filter(({ level }) => {
            //   return (
            //     activeLevels.length === 0 ||
            //     activeLevels.some((lev) => {
            //       return level.toLowerCase() === lev.toLowerCase();
            //     })
            //   );
            // })
            ?.map((course) => (
              <CoursePreview
                course={course}
                key={course.id}
                selected={
                  activeCategories.length === 0 ||
                  (activeCategories.some((category) =>
                    course.id.toLowerCase().startsWith(category.toLowerCase()),
                  ) &&
                    (activeLevels.length === 0 ||
                      activeLevels.some(
                        (lev) =>
                          course.level.toLowerCase() === lev.toLowerCase(),
                      )))
                }
              />
            ))}
        </div>
      </div>
    </MainLayout>
  );
};
