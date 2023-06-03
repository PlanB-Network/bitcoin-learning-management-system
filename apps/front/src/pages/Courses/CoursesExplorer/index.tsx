import { useTranslation } from 'react-i18next';

import { trpc } from '@sovereign-academy/api-client';
import { JoinedCourse } from '@sovereign-academy/types';

import { MainLayout } from '../../../components';
import { CoursePreview } from '../../../components/CoursePreview';
import { SolarSystem } from '../../../components/SolarSystem';
import type { Course } from '../../../components/SolarSystem';

// Hardcoded unreleased courses
const unreleasedCourses: Course[] = [
  {
    id: 'fin101',
    name: 'Introduction à la finance',
    level: 'beginner',
    language: 'fr',
    unreleased: true,
  },
  {
    id: 'btc301',
    name: 'Coldcard et Sparrow',
    level: 'advanced',
    language: 'fr',
    unreleased: true,
  },
  {
    id: 'ln301',
    name: 'Cours théorique avancé sur le Lightning Network',
    level: 'advanced',
    language: 'fr',
    unreleased: true,
  },
  {
    id: 'fin205',
    name: 'Analyse des crises financières majeures',
    level: 'intermediate',
    language: 'fr',
    unreleased: true,
  },
  {
    id: 'econ205',
    name: 'Etude des hyperinflations',
    level: 'intermediate',
    language: 'fr',
    unreleased: true,
  },
];

export const CoursesExplorer = () => {
  const { i18n } = useTranslation();
  const { data: courses } = trpc.content.getCourses.useQuery();

  const coursesInLanguage = courses?.filter(
    (course) => course.language === i18n.language
  );

  const coursesWithUnreleased = [
    ...(coursesInLanguage || []),
    ...unreleasedCourses,
  ];

  return (
    <MainLayout>
      <div className="bg-primary-900 flex w-full flex-col px-[10%] pt-8 text-white md:px-[20%]">
        <h1 className="-ml-4 text-[62px] font-thin md:text-[128px]">Courses</h1>
        <div className="space-y-6 text-justify text-sm">
          <p className="font-bold">
            Welcome to the core of the Sovereign University: the gate to the
            educational portal.
          </p>
          <p>
            Here you will be able to find a large numbers of courses related to
            Bitcoin as a whole, with a large range of subjects. This educational
            content is organic, growing along as Bitcoin grows. All content is
            free, open-source and accessible to everyone. Please look up at the
            courses index, organized in circles to adapt to anyone's path of
            learning.
          </p>
        </div>
      </div>
      <div className="bg-primary-900 flex w-full flex-col items-center md:h-full">
        <SolarSystem courses={coursesWithUnreleased} />
      </div>
    </MainLayout>
  );
};
