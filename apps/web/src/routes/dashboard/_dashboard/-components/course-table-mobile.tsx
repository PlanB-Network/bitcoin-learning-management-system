import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CourseProgressExtended, JoinedCourse } from '@blms/types';
import type { CarouselApi } from '@blms/ui';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@blms/ui';

import bitcoinSvg from '#src/assets/icons/btc.svg';
import businessSvg from '#src/assets/icons/luggage.svg';
import miningSvg from '#src/assets/icons/mining-black.svg';
import securitySvg from '#src/assets/icons/padlock-black.svg';
import protocolSvg from '#src/assets/icons/protocol-black.svg';
import socialStudiesSvg from '#src/assets/icons/world-black.svg';

import { CourseDashboardCard } from './course-dashboard-card.tsx';
import { courseCategoriesDashboard } from './course-table.tsx';

const categoryIcons = {
  bitcoin: bitcoinSvg,
  business: businessSvg,
  protocol: protocolSvg,
  security: securitySvg,
  'social studies': socialStudiesSvg,
  mining: miningSvg,
};

export const CourseTableMobile = ({
  courses,
  progress,
}: {
  courses: JoinedCourse[];
  progress: CourseProgressExtended[];
}) => {
  const { t } = useTranslation();
  const { combinedMap, coursesByCategory } = useMemo(() => {
    const progressMap = new Map(progress.map((p) => [p.courseId, p]));

    const combinedMap = new Map(
      courses.map((course) => [
        course.id,
        { course, progress: progressMap.get(course.id) || null },
      ]),
    );

    const coursesByCategory: Record<
      string,
      Array<{ course: JoinedCourse; progress: CourseProgressExtended | null }>
    > = {};

    for (const { course, progress } of combinedMap.values()) {
      const category = course.topic?.toLowerCase();
      if (!category) continue;

      if (!coursesByCategory[category]) {
        coursesByCategory[category] = [];
      }

      coursesByCategory[category].push({ course, progress });
    }

    return { progressMap, combinedMap, coursesByCategory };
  }, [courses, progress]);

  const getStatusStyles = (
    progress: CourseProgressExtended | null,
    isSelected: boolean,
  ) => {
    if (!progress) {
      return {
        text: t('dashboard.myCourses.notStarted'),
        bgColor: isSelected ? 'bg-newGray-5' : 'bg-newGray-4',
      };
    }

    const { progressPercentage } = progress;

    if (progressPercentage === 100) {
      return {
        text: t('dashboard.myCourses.completed'),
        bgColor: isSelected ? 'bg-brightGreen-5' : 'bg-brightGreen-4',
      };
    }

    return {
      text: t('dashboard.myCourses.inprogress'),
      bgColor: isSelected ? 'bg-darkOrange-5' : 'bg-darkOrange-4',
    };
  };

  const getHighestProgressCourse = () => {
    let highestProgressCourse: {
      courseId: string;
      progressPercentage: number;
    } | null = null;

    for (const { course, progress } of combinedMap.values()) {
      if (
        progress &&
        progress.progressPercentage < 100 &&
        (!highestProgressCourse ||
          progress.progressPercentage >
            highestProgressCourse.progressPercentage)
      ) {
        highestProgressCourse = {
          courseId: course.id,
          progressPercentage: progress.progressPercentage,
        };
      }
    }

    if (!highestProgressCourse) {
      return 'btc101';
    }

    return highestProgressCourse.courseId;
  };

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCourse(getHighestProgressCourse());
  }, [combinedMap]);

  const [api, setApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (api && selectedCourse) {
      const flatCourses = courseCategoriesDashboard.flatMap((category) =>
        (coursesByCategory[category.toLowerCase()] || []).map(
          ({ course }) => course,
        ),
      );
      const index = flatCourses.findIndex(
        (course) => course.id === selectedCourse,
      );
      if (index >= 0) {
        api.scrollTo(index);
      }
    }
  });

  useEffect(() => {
    if (api) {
      const onSelect = () => {
        const selectedIndex = api.selectedScrollSnap();
        const flatCourses = courseCategoriesDashboard.flatMap((category) =>
          (coursesByCategory[category.toLowerCase()] || []).map(
            ({ course }) => course,
          ),
        );
        setSelectedCourse(flatCourses[selectedIndex]?.id || null);
      };
      api.on('select', onSelect);
      return () => {
        api.off('select', onSelect);
      };
    }
  }, [api, coursesByCategory]);

  return (
    <section className="flex flex-col md:hidden max-h-[calc(100dvh-140px)]">
      <div className="overflow-y-auto no-scrollbar rounded-[10px] w-full max-w-[330px] min-[425px]:max-w-[350px] min-[650px]:max-w-[432px] mx-auto">
        <Table className="size-full bg-newGray-6 rounded-[10px] overflow-hidden">
          <TableHeader className="border-none">
            <TableRow>
              {courseCategoriesDashboard.map((category) => (
                <TableHead
                  key={category}
                  className="text-center py-2 w-[35px] min-[425px]:w-[50px] px-1 mx-auto"
                >
                  <div className="w-[30px] max-w-[30px] flex mx-auto">
                    <img
                      src={
                        categoryIcons[category as keyof typeof categoryIcons] ||
                        ''
                      }
                      alt={category}
                      className="size-[30px] mx-auto"
                    />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-newGray-6">
            <TableRow>
              {courseCategoriesDashboard.map((category) => (
                <TableCell
                  key={category}
                  className="align-top text-center px-[2.5px] pb-2 !w-[35px] pt-0"
                >
                  <div className="flex flex-col gap-[5px] min-[650px]:gap-2.5">
                    {(coursesByCategory[category.toLowerCase()] || []).map(
                      ({ course, progress }) => {
                        const { bgColor } = getStatusStyles(
                          progress,
                          selectedCourse === course.id,
                        );
                        const isActive = selectedCourse === course.id;
                        const activeBorder = isActive
                          ? 'border border-black'
                          : '';

                        return (
                          <div
                            key={course.id}
                            role="button"
                            tabIndex={0}
                            className={`rounded-md size-[35px] min-[425px]:size-[50px] ${bgColor} ${activeBorder} flex items-center justify-center p-4 mx-auto`}
                            onClick={() => setSelectedCourse(course.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setSelectedCourse(course.id);
                              }
                            }}
                          >
                            <span className="text-center text-brightGreen-11 body-medium-12px uppercase !leading-[110%]">
                              {course.id.slice(0, 3)}
                              <br />
                              {course.id.slice(3)}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Carousel setApi={setApi} opts={{ loop: false }} className="w-full">
          <CarouselContent className="ml-0">
            {courseCategoriesDashboard
              .flatMap((category) =>
                (coursesByCategory[category.toLowerCase()] || []).map(
                  ({ course, progress }) => ({ course, progress }),
                ),
              )
              .map(({ course, progress }) => (
                <CarouselItem
                  key={course.id}
                  className="w-full px-1 min-[425px]:max-w-[320px]"
                >
                  <CourseDashboardCard course={course} progress={progress} />
                </CarouselItem>
              ))}
          </CarouselContent>

          <CarouselPrevious variant="carouselDashboard" className="-left-4" />
          <CarouselNext variant="carouselDashboard" className="-right-4" />
        </Carousel>
      </div>
    </section>
  );
};
