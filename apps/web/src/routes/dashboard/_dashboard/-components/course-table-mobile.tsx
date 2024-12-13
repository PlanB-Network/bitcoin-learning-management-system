import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CourseProgressExtended, JoinedCourse } from '@blms/types';
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
import { categories } from './course-table.tsx';

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

  const getStatusStyles = (progress: CourseProgressExtended | null) => {
    if (!progress)
      return {
        text: t('dashboard.myCourses.notStarted'),
        bgColor: 'bg-newGray-5',
      };

    const { progressPercentage } = progress;
    if (progressPercentage === 100) {
      return {
        text: t('dashboard.myCourses.completed'),
        bgColor: 'bg-brightGreen-4',
      };
    }
    if (progressPercentage > 0) {
      return {
        text: t('dashboard.myCourses.inprogress'),
        bgColor: 'bg-darkOrange-4',
      };
    }
    return {
      text: t('dashboard.myCourses.notStarted'),
      bgColor: 'bg-newGray-5',
    };
  };

  const carouselRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const handleScrollToCourse = (courseId: string) => {
    const courseRef = carouselRefs.current.get(courseId);
    if (courseRef) {
      courseRef.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
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

    return highestProgressCourse ? highestProgressCourse.courseId : null;
  };

  useEffect(() => {
    if (!selectedCourse) {
      const courseToScrollTo = getHighestProgressCourse();
      if (courseToScrollTo) {
        setSelectedCourse(courseToScrollTo);
        handleScrollToCourse(courseToScrollTo);
      } else {
        setSelectedCourse('btc101');
        handleScrollToCourse('btc101');
      }
    }
  }, [selectedCourse]);

  return (
    <section className="max-w-[320px] w-full mx-auto md:hidden rounded-[10px]">
      <div className="h-[277px] overflow-scroll no-scrollbar">
        <Table className="size-full bg-newGray-6 rounded-[10px] overflow-hidden">
          <TableHeader className="border-none">
            <TableRow>
              {categories.map((category) => (
                <TableHead
                  key={category}
                  className="text-center py-2 w-[35px] px-1 mx-auto"
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
              {categories.map((category) => (
                <TableCell
                  key={category}
                  className="align-top text-center px-[2.5px] pb-2 !w-[35px]"
                >
                  <div className="flex flex-col w-[35px] gap-[5px] mx-auto">
                    {(coursesByCategory[category.toLowerCase()] || []).map(
                      ({ course, progress }, i) => {
                        const { bgColor } = getStatusStyles(progress);

                        const isActive = selectedCourse === course.id;
                        const isHighestProgress =
                          !selectedCourse &&
                          getHighestProgressCourse() === course.id;
                        const activeBorder =
                          isActive || isHighestProgress
                            ? 'border border-black'
                            : '';

                        return (
                          <div
                            key={i}
                            role="button"
                            tabIndex={0}
                            className={`rounded-md size-[35px] ${bgColor} ${activeBorder} flex items-center justify-center p-4 mx-auto`}
                            onClick={() => {
                              setSelectedCourse(course.id);
                              handleScrollToCourse(course.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setSelectedCourse(course.id);
                                handleScrollToCourse(course.id);
                              }
                            }}
                          >
                            <span className="text-center text-brightGreen-11 body-medium-12px uppercase">
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
        <Carousel opts={{ loop: true }} className="w-full max-w-[320px]">
          <CarouselContent className="ml-0">
            {categories
              .flatMap((category) =>
                (coursesByCategory[category.toLowerCase()] || []).map(
                  ({ course, progress }) => ({ course, progress }),
                ),
              )
              .map(({ course, progress }) => {
                return (
                  <CarouselItem
                    key={course.id}
                    className="max-h-[146px] w-full max-w-[320px] px-1"
                    ref={(el) => carouselRefs.current.set(course.id, el)}
                  >
                    <CourseDashboardCard course={course} progress={progress} />
                  </CarouselItem>
                );
              })}
          </CarouselContent>

          <CarouselPrevious
            variant={'carouselDashboard'}
            className="-left-4"
            onClick={() => {
              const currentIndex = categories
                .flatMap((category) =>
                  (coursesByCategory[category.toLowerCase()] || []).map(
                    ({ course }) => course,
                  ),
                )
                .findIndex((course) => course.id === selectedCourse);

              const prevCourse =
                categories.flatMap((category) =>
                  (coursesByCategory[category.toLowerCase()] || []).map(
                    ({ course }) => course,
                  ),
                )[currentIndex - 1] ||
                categories
                  .flatMap((category) =>
                    (coursesByCategory[category.toLowerCase()] || []).map(
                      ({ course }) => course,
                    ),
                  )
                  .at(-1);

              setSelectedCourse(prevCourse.id);
              handleScrollToCourse(prevCourse.id);
            }}
          />

          <CarouselNext
            variant={'carouselDashboard'}
            className="-right-4"
            onClick={() => {
              const currentIndex = categories
                .flatMap((category) =>
                  (coursesByCategory[category.toLowerCase()] || []).map(
                    ({ course }) => course,
                  ),
                )
                .findIndex((course) => course.id === selectedCourse);

              const nextCourse =
                categories.flatMap((category) =>
                  (coursesByCategory[category.toLowerCase()] || []).map(
                    ({ course }) => course,
                  ),
                )[currentIndex + 1] ||
                categories.flatMap((category) =>
                  (coursesByCategory[category.toLowerCase()] || []).map(
                    ({ course }) => course,
                  ),
                )[0];

              setSelectedCourse(nextCourse.id);
              handleScrollToCourse(nextCourse.id);
            }}
          />
        </Carousel>
      </div>
    </section>
  );
};
