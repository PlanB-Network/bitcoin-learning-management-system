import { useTranslation } from 'react-i18next';

import { trpc } from '@sovereign-academy/api-client';

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

const categories = [
  {
    prefix: 'btc',
    topic: 'Bitcoin',
  },
  {
    prefix: 'ln',
    topic: 'Lightning Network',
  },
  {
    prefix: 'econ',
    topic: 'Austrian Economics',
  },
  {
    prefix: 'secu',
    topic: 'Security & Privacy',
  },
  {
    prefix: 'fin',
    topic: 'Finance',
  },
  {
    prefix: 'min',
    topic: 'Mining',
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
    <MainLayout footerVariant="dark">
      <div className="bg-primary-900 flex w-full flex-col px-[10%] pt-8 text-white md:px-[20%]">
        <h1 className="-ml-4 text-[62px] font-thin md:text-[128px]">Courses</h1>
        <div className="space-y-6 text-justify text-base lg:text-lg">
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
        <div className="bg-primary-900 flex w-full flex-col items-center md:h-full">
          <SolarSystem courses={coursesWithUnreleased} />
        </div>
        <div className="mb-16 flex w-full flex-col">
          <h3 className="mb-5 text-xl font-semibold">
            Bitcoin education is a journey not a destination
          </h3>
          <div className="flex flex-col space-y-5 text-base font-thin">
            <span>
              If you've started exploring the Bitcoin rabbit hole, you must know
              that it's an endless journey with many paths. Here at the
              university, we understand this and have design our educational
              content to be non-linear, autonomous and as extensive as it can
              be.
            </span>
            <span>
              You will be able to pick your own path and go along it, gaining
              skills and knowledge as far as your motivation goes.
            </span>
            <span>All our courses are 100% free so nothing can stop you.</span>
          </div>
        </div>
        <div className="mb-16 flex w-full flex-col">
          <h3 className="mb-10 text-xl font-semibold">
            All courses are named after their main topic
          </h3>
          <div className="grid grid-cols-1 items-center justify-center px-5 text-base md:grid-cols-2 xl:grid-cols-3">
            {categories.map(({ prefix, topic }) => (
              <div className="my-5 flex flex-row place-items-center space-x-3">
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
            <CoursePreview course={course} className="h-auto" />
          ))}
      </div>
      <div className="bg-primary-900 w-full px-10 pb-6 pt-3 text-right text-orange-900 md:px-[12%] ">
        .... and more to come !
      </div>
      <div className="bg-primary-900 flex w-full flex-col space-y-3 px-5 text-lg text-white md:px-[20%] ">
        <h4 className="mb-3 text-center text-3xl font-semibold">
          Our professors are here for you !
        </h4>
        <span>
          At the Sovereign University, our professors have complete autonomy
          over their content and the tools they want you to explore, as long as
          they follow the code of ethics. They are passionate bitcoiners from
          various backgrounds.
        </span>
        <span>
          If you want to improve on a course or provide your own, you can simply
          do so via the GitHub. To support a professor you can either grade
          one's course, tip the professor directly or become a university member
          to support the platform.
        </span>
      </div>
    </MainLayout>
  );
};
