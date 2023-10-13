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
      prefix: 'min',
      topic: t('courses.categories.min'),
    },
  ];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const coursesWithUnreleased = [
    ...(coursesInLanguage || []),
    ...unreleasedCourses,
  ];

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

          <div className="mb-16 hidden w-full flex-col px-8 sm:flex">
            <div className="rounded-3xl border-2 border-white bg-blue-800 px-5 text-base ">
              <div className="flex flex-col">
                <div className="flex flex-row gap-6 xl:gap-12">
                  <span className="mt-4 whitespace-nowrap font-semibold">
                    {t('courses.explorer.s3PickTopic')}
                  </span>
                  <TopicPicker
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                  />
                </div>
                <div className="flex flex-row gap-6 xl:gap-12">
                  <span className="mt-6 whitespace-nowrap font-semibold">
                    {t('courses.explorer.s3PickLevel')}
                  </span>
                  <LevelPicker courseId={t('courses.explorer.pageTitle')} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 bg-blue-900 px-5 sm:grid-cols-2  md:grid-cols-3 lg:max-w-6xl xl:grid-cols-4">
          {coursesInLanguage
            ?.filter(({ id }) => id !== 'btc102' && id !== 'min201')
            .map((course) => (
              <CoursePreview
                course={course}
                className="h-auto"
                key={course.id}
              />
            ))}
        </div>
      </div>
    </MainLayout>
  );
};
