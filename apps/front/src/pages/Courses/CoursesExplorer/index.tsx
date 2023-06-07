import { useTranslation } from 'react-i18next';

import { trpc } from '@sovereign-academy/api-client';

import { MainLayout } from '../../../components';
import { CoursePreview } from '../../../components/CoursePreview';
import { SolarSystem } from '../../../components/SolarSystem';
import type { Course } from '../../../components/SolarSystem';

export const CoursesExplorer = () => {
  const { i18n, t } = useTranslation();
  const { data: courses } = trpc.content.getCourses.useQuery();

  const coursesInLanguage = courses?.filter(
    (course) => course.language === i18n.language
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

  const coursesWithUnreleased = [
    ...(coursesInLanguage || []),
    ...unreleasedCourses,
  ];

  return (
    <MainLayout footerVariant="dark">
      <div className="bg-primary-900 flex w-full flex-col px-[10%] pt-8 text-white md:px-[20%]">
        <h1 className="-ml-4 text-[62px] font-thin md:text-[128px]">
          {t('courses.explorer.pageTitle')}
        </h1>
        <div className="space-y-6 text-justify text-base lg:text-lg">
          <p className="font-bold">{t('courses.explorer.s1t1')}</p>
          <p>{t('courses.explorer.s1p1')}</p>
        </div>
        <div className="bg-primary-900 flex w-full flex-col items-center md:h-full">
          <SolarSystem courses={coursesWithUnreleased} />
        </div>
        <div className="mb-16 flex w-full flex-col">
          <h3 className="mb-5 text-xl font-semibold">
            {t('courses.explorer.s2t1')}
          </h3>
          <div className="flex flex-col space-y-5 text-base font-thin">
            <span>{t('courses.explorer.s2p1')}</span>
            <span>{t('courses.explorer.s2p2')}</span>
            <span>{t('courses.explorer.s2p3')}</span>
          </div>
        </div>
        <div className="mb-16 flex w-full flex-col">
          <h3 className="mb-10 text-xl font-semibold">
            {t('courses.explorer.s3t1')}
          </h3>
          <div className="grid grid-cols-1 items-center justify-center px-5 text-base md:grid-cols-2 xl:grid-cols-3">
            {categories.map(({ prefix, topic }, index) => (
              <div
                className="my-5 flex flex-row place-items-center space-x-3"
                key={index}
              >
                <div className="flex h-16 w-16 place-items-center justify-center rounded-full border-4 border-orange-900 text-lg font-semibold uppercase lg:h-24 lg:w-24 lg:text-2xl">
                  {prefix}
                </div>
                <span className="w-1/2 text-base font-thin uppercase md:text-lg">
                  {topic}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-primary-900 grid grid-cols-1 px-7 sm:grid-cols-2 md:grid-cols-3 md:px-[10%] xl:grid-cols-4">
        {coursesInLanguage
          ?.filter(({ id }) => id !== 'btc102' && id !== 'min201')
          .map((course) => (
            <CoursePreview course={course} className="h-auto" key={course.id} />
          ))}
      </div>
      <div className="bg-primary-900 w-full px-10 pb-6 pt-3 text-right text-orange-900 md:px-[12%] ">
        {t('courses.explorer.moreToCome')}
      </div>
      <div className="bg-primary-900 flex w-full flex-col space-y-3 px-5 text-lg text-white md:px-[20%] ">
        <h4 className="mb-3 text-center text-3xl font-semibold">
          {t('courses.explorer.footerTitle')}
        </h4>
        <span>{t('courses.explorer.footerp1')}</span>
        <span>{t('courses.explorer.footerp2')}</span>
      </div>
    </MainLayout>
  );
};
