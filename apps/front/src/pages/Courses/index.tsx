import { MainLayout } from '../../components';
import { SolarSystem } from '../../components/SolarSystem';
import type { Course } from '../../components/SolarSystem';

// TODO: Fetch courses from API and remove this mock
const courses: Course[] = [
  {
    id: 'BTC101',
    title: 'Le parcours Bitcoin',
    description: 'Bitcoin 101',
    level: 'beginner',
  },
  {
    id: 'FIN101',
    title: 'Le parcours Bitcoin',
    description: 'Finance 101',
    level: 'beginner',
  },
  {
    id: 'SECU101',
    title: 'Le parcours Bitcoin',
    description: 'Security 101',
    level: 'beginner',
  },
  {
    id: 'BTC102',
    title: 'Le parcours Bitcoin',
    description: 'Bitcoin 102',
    level: 'beginner',
  },
  {
    id: 'LN201',
    title: 'Le parcours Bitcoin',
    description: 'Lightning 201',
    level: 'intermediate',
  },
  {
    id: 'BTC201',
    title: 'Bitcoin et la société',
    description: 'Bitcoin 201',
    level: 'intermediate',
  },
  {
    id: 'LN202',
    title: 'Le parcours Bitcoin',
    description: 'Lightning 202',
    level: 'intermediate',
  },
  {
    id: 'BTC205',
    title: 'Le parcours Bitcoin',
    description: 'Bitcoin 205',
    level: 'intermediate',
  },
  {
    id: 'BTC301',
    title: 'Le parcours Bitcoin',
    description: 'Bitcoin 301',
    level: 'advanced',
    unreleased: true,
  },
  {
    id: 'LN301',
    title: 'Le parcours Bitcoin',
    description: 'Lightning 301',
    level: 'advanced',
    unreleased: true,
  },
  {
    id: 'BTC999',
    title: 'Le parcours Bitcoin',
    description: 'Bitcoin 999',
    level: 'expert',
    unreleased: true,
  },
];

export const Courses = () => {
  return (
    <MainLayout>
      <div className="flex flex-col w-full pt-8 px-[10%] md:px-[20%] text-white bg-primary-900">
        <h1 className="-ml-4 text-[62px] md:text-[128px] font-thin">Courses</h1>
        <div className="space-y-6 text-s text-justify">
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
      <div className="flex flex-col items-center bg-primary-900 w-full md:h-full">
        <SolarSystem courses={courses} />
      </div>
    </MainLayout>
  );
};
