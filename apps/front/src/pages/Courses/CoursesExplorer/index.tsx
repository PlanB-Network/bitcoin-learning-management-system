import { trpc } from '@sovereign-academy/api-client';

import { MainLayout } from '../../../components';
import { SolarSystem } from '../../../components/SolarSystem';
import type { Course } from '../../../components/SolarSystem';

// Hardcoded unreleased courses
const unreleasedCourses: Course[] = [
  {
    id: 'btc301',
    name: 'Le parcours Bitcoin',
    level: 'advanced',
    language: 'en',
    unreleased: true,
  },
  {
    id: 'ln301',
    name: 'Le parcours Bitcoin',
    level: 'advanced',
    language: 'en',
    unreleased: true,
  },
  {
    id: 'btc999',
    name: 'Le parcours Bitcoin',
    level: 'expert',
    language: 'en',
    unreleased: true,
  },
];

export const CoursesExplorer = () => {
  const { data: courses } = trpc.content.getCourses.useQuery();

  const coursesWithUnreleased = [...(courses || []), ...unreleasedCourses];

  return (
    <MainLayout>
      <div className="flex flex-col w-full pt-8 px-[10%] md:px-[20%] text-white bg-primary-900">
        <h1 className="-ml-4 text-[62px] md:text-[128px] font-thin">Courses</h1>
        <div className="space-y-6 text-justify text-s">
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
      <div className="flex flex-col items-center w-full bg-primary-900 md:h-full">
        <SolarSystem courses={coursesWithUnreleased} />
      </div>
    </MainLayout>
  );
};
