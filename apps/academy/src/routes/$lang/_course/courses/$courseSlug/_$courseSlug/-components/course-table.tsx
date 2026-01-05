import { CourseLevel } from '@blms/constants';
import { BTC101ID } from '@blms/shared';
import type { CourseProgressExtended, JoinedCourse } from '@blms/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@blms/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CourseDashboardCard } from '#src/routes/$lang/_course/my-courses/-components/course-dashboard-card.tsx';
import { toCamelCase } from '#src/utils/string.ts';

export const courseCategoriesDashboard = [
  'bitcoin',
  'business',
  'mining',
  'protocol',
  'security',
  'social studies',
];

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
    if (!courseName) return { bgColor: 'bg-white', text: null };
    const course = courses.find((c) => c.name === courseName);
    if (!course) return { bgColor: 'bg-white', text: null };

    const progressForCourse = progressMap.get(course.id);
    if (!progressForCourse)
      return {
        bgColor: 'bg-neutral-100 hover:bg-neutral-50',
        text: t('dashboard.myCourses.notStarted'),
      };

    const { progressPercentage } = progressForCourse;
    if (progressPercentage === 100)
      return {
        bgColor: 'bg-green-300 hover:bg-green-400',
        text: t('dashboard.myCourses.completed'),
      };
    if (progressPercentage >= 0)
      return {
        bgColor: 'bg-orange-400 hover:bg-orange-500',
        text: t('dashboard.myCourses.inProgress'),
      };
    return {
      bgColor: 'bg-neutral-100 hover:bg-neutral-50',
      text: t('dashboard.myCourses.notStarted'),
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
    <section className="max-md:hidden md:flex flex-col min-[1440px]:flex-row md:gap-4 2xl:gap-16 w-fit max-[1440px]:max-w-[733px] bg-brown-100 p-2.5 rounded-[20px]">
      <div className="max-w-[733px] max-md:hidden shrink-0 bg-white px-4 py-8 rounded-xl">
        <Table maxHeightClass="" className="size-full border-spacing-2">
          {/* Table Header */}
          <TableHeader className="border-none">
            <TableRow>
              <TableHead className="bg-white p-1 text-sm" />
              {courseCategoriesDashboard.map((category) => {
                const translatedCategory = t(`words.${toCamelCase(category)}`);

                return (
                  <TableHead
                    key={category}
                    className="text-center lg:w-[101px] max-w-[101px] pb-3 pt-1.5"
                  >
                    <div
                      title={translatedCategory}
                      className="truncate capitalize bg-orange-700 text-white desktop-caption1 py-px px-1 rounded-[5px] h-[22px] lg:w-[101px] mx-auto text-center"
                    >
                      {translatedCategory}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="bg-neutral-50 p-1 gap-1">
            {Object.values(CourseLevel).map((level) => (
              <TableRow key={level}>
                <TableCell className="p-1 bg-white! lg:w-[37px]">
                  <div className="max-h truncate capitalize desktop-caption1 text-black py-px px-1 bg-brown-200 rounded-[5px] self-center align-middle text-center [writing-mode:vertical-rl] transform-[rotate(180deg)]">
                    {t(`words.level.${toCamelCase(level)}`)}
                  </div>
                </TableCell>

                {/* Course Cells */}
                {courseCategoriesDashboard.map((category, categoryIndex) => {
                  const coursesForCell = courses
                    .filter(
                      (c) =>
                        c.level?.toLowerCase() === level.toLowerCase() &&
                        c.topic?.toLowerCase() === category.toLowerCase(),
                    )
                    .sort((a, b) =>
                      a.index.slice(3).localeCompare(b.index.slice(3)),
                    );

                  return (
                    <TableCell
                      key={`${level}-${category}`}
                      className={`text-center align-middle lg:w-[115px] p-[2.5px] ${categoryIndex % 2 === 0 ? 'bg-neutral-50' : 'bg-[#f7f1e8]'}`}
                    >
                      <div className="grid grid-cols-2 grid-rows-2 gap-1">
                        {[0, 1, 2, 3, 4, 5].map((i) => {
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
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedCourse(course?.name)
                                    }
                                    className={`md:w-[50px] md:h-13 rounded ${bgColor} flex items-center justify-center hover:course-navigation-sm`}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        setSelectedCourse(course?.name);
                                      }
                                    }}
                                  >
                                    {course && (
                                      <span className="w-[30px] subtitle-small-med-14px break-normal leading-none text-center uppercase">
                                        {course.index.slice(0, 3)}
                                        <br />
                                        {course.index.slice(3)}
                                      </span>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                {status?.text && (
                                  <TooltipContent
                                    side="right"
                                    align="end"
                                    alignOffset={-50}
                                    className={`text-base leading-4 font-medium w-[200px] text-start p-2 ${bgColor}`}
                                  >
                                    <span className="text-base leading-4 font-medium text-neutral-800 line-clamp-2">
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
        <div className="min-[1440px]:max-w-[280px] min-[1440px]:min-h-full w-full flex flex-col">
          {[...combinedMap.values()]
            .filter(({ course }) => course.name === selectedCourse)
            .map(({ course, progress }) => (
              <CourseDashboardCard
                key={course.id}
                course={course}
                progress={progress}
              />
            ))}
        </div>
      ) : highestProgressCourse ? (
        <div className="min-[1440px]:max-w-[280px] min-[1440px]:min-h-full w-full flex flex-col">
          <CourseDashboardCard
            course={highestProgressCourse.course}
            progress={highestProgressCourse.progress}
          />
        </div>
      ) : (
        <div className="min-[1440px]:max-w-[280px] min-[1440px]:min-h-full w-full flex flex-col">
          {combinedMap.get(BTC101ID)?.course ? (
            <CourseDashboardCard
              course={combinedMap.get(BTC101ID)!.course}
              progress={combinedMap.get(BTC101ID)!.progress ?? null}
            />
          ) : null}
        </div>
      )}
    </section>
  );
};
