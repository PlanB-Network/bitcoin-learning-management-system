import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CourseProgressExtended, JoinedCourse } from '@blms/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@blms/ui';

import { CourseDashboardCard } from './course-dashboard-card.tsx';

// eslint-disable-next-line react-refresh/only-export-components
export const courseCategoriesDashboard = [
  'bitcoin',
  'business',
  'mining',
  'protocol',
  'security',
  'social studies',
];

const levels = ['beginner', 'intermediate', 'advanced', 'wizard'];

export const CourseTable = ({
  courses,
  progress,
}: {
  courses: JoinedCourse[];
  progress: CourseProgressExtended[];
}) => {
  const { t } = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const progressMap = new Map(progress.map((p) => [p.courseId, p]));
  const combinedMap = new Map(
    courses.map((course) => [
      course.id,
      {
        course,
        progress: progressMap.get(course.id) || null,
      },
    ]),
  );
  const getCourseStatus = (courseName: string | null) => {
    if (!courseName) return { text: null, bgColor: 'bg-white' };
    const course = courses.find((c) => c.name === courseName);
    if (!course) return { text: null, bgColor: 'bg-white' };

    const progressForCourse = progressMap.get(course.id);
    if (!progressForCourse)
      return {
        text: t('dashboard.myCourses.notStarted'),
        bgColor: 'bg-newGray-5 hover:bg-newGray-6',
      };

    const { progressPercentage } = progressForCourse;
    if (progressPercentage === 100)
      return {
        text: t('dashboard.myCourses.completed'),
        bgColor: 'bg-brightGreen-4 hover:bg-brightGreen-5',
      };
    if (progressPercentage >= 0)
      return {
        text: t('dashboard.myCourses.inprogress'),
        bgColor: 'bg-darkOrange-4 hover:bg-darkOrange-5',
      };
    return {
      text: t('dashboard.myCourses.notStarted'),
      bgColor: 'bg-newGray-5 hover:bg-newGray-6',
    };
  };

  let highestProgressCourse = null;

  for (const { course, progress } of combinedMap.values()) {
    if (
      progress &&
      progress.progressPercentage < 100 &&
      (!highestProgressCourse ||
        progress.progressPercentage >
          highestProgressCourse.progress.progressPercentage)
    ) {
      highestProgressCourse = { course, progress };
    }
  }

  return (
    <section className="max-md:hidden md:flex flex-col 2xl:flex-row md:gap-[18px] 2xl:gap-16 w-full max-lg:mx-auto max-2xl:max-w-[698px]">
      <div className="max-w-[698px] max-md:hidden shrink-0">
        <Table
          maxHeightClass="max-h-[665px]"
          className="size-full border-spacing-[10px]"
        >
          <TableCaption className="max-2xl:hidden !body-16px-medium text-black mt-[31px]">
            {t('dashboard.myCourses.newCourses')}
          </TableCaption>
          {/* Table Header */}
          <TableHeader className="border-none">
            <TableRow>
              <TableHead className="bg-white p-1 text-sm" />
              {courseCategoriesDashboard.map((category) => (
                <TableHead
                  key={category}
                  className="text-center lg:w-[101px] max-w-[101px] pb-[11px] pt-[6px]"
                >
                  <div className="capitalize bg-darkOrange-7 text-white desktop-caption1 py-px px-[5px] rounded-[5px] h-[22px] lg:w-[101px] mx-auto text-center">
                    {category}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="bg-newGray-6 p-[5px] gap-[5px]">
            {levels.map((level) => (
              <TableRow key={level}>
                <TableCell className="p-1 !bg-white lg:w-[37px]">
                  <div className="capitalize desktop-caption1 text-black py-[5px] px-px bg-tertiary-2 rounded-[5px] self-center align-middle text-center [writing-mode:vertical-rl] [transform:rotate(180deg)]">
                    {level}
                  </div>
                </TableCell>

                {/* Course Cells */}
                {courseCategoriesDashboard.map((category, categoryIndex) => {
                  const coursesForCell = courses.filter(
                    (c) =>
                      c.level?.toLowerCase() === level.toLowerCase() &&
                      c.topic?.toLowerCase() === category.toLowerCase(),
                  );

                  return (
                    <TableCell
                      key={`${level}-${category}`}
                      className={`text-center align-middle lg:w-[115px] p-[2.5px] ${categoryIndex % 2 === 0 ? 'bg-newGray-6' : 'bg-[#f7f1e8]'}`}
                    >
                      <div className="grid grid-cols-2 grid-rows-2 gap-1">
                        {[0, 1, 2, 3].map((i) => {
                          const course = coursesForCell[i];
                          const status = getCourseStatus(course?.name);

                          const isWhite = categoryIndex % 2 === 0;
                          const bgColor = course
                            ? status?.bgColor
                            : isWhite
                              ? 'bg-white'
                              : 'bg-[#fff9f0]';

                          return (
                            <TooltipProvider key={i}>
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger>
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    className={`md:w-[50px] md:h-[52px] rounded hover:cursor-fancy ${bgColor} flex items-center justify-center hover:course-navigation-sm`}
                                    onClick={() =>
                                      setSelectedCourse(course?.name)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        setSelectedCourse(course?.name);
                                      }
                                    }}
                                  >
                                    {course && (
                                      <span className="w-[30px] subtitle-small-med-14px break-normal leading-none text-center uppercase">
                                        {course.id.slice(0, 3)}
                                        <br />
                                        {course.id.slice(3)}
                                      </span>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                {status?.text && (
                                  <TooltipContent
                                    side="right"
                                    align="end"
                                    alignOffset={-50}
                                    className={`text-base leading-4 font-medium w-[200px] text-start p-2 ${bgColor}`}
                                  >
                                    <span className="text-base leading-4 font-medium text-newBlack-3 line-clamp-2">
                                      {course ? course.name : status?.text}
                                    </span>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedCourse ? (
        <div className="2xl:max-w-[280px] w-full">
          {[...combinedMap.values()]
            .filter(({ course }) => course.name === selectedCourse)
            .map(({ course, progress }) => (
              <div key={course.id}>
                <CourseDashboardCard course={course} progress={progress} />
              </div>
            ))}
        </div>
      ) : highestProgressCourse ? (
        <div className="2xl:max-w-[280px] w-full">
          <CourseDashboardCard
            course={highestProgressCourse.course}
            progress={highestProgressCourse.progress}
          />
        </div>
      ) : (
        <div className="2xl:max-w-[280px] w-full">
          {combinedMap.get('btc101')?.course ? (
            <CourseDashboardCard
              course={combinedMap.get('btc101')!.course}
              progress={combinedMap.get('btc101')!.progress ?? null}
            />
          ) : null}
        </div>
      )}
    </section>
  );
};
