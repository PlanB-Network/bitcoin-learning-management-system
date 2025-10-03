/** biome-ignore-all lint/correctness/useHookAtTopLevel: TODO check */

import { CourseLevel } from '@blms/constants';
import type { JoinedCourse } from '@blms/types';
import { Button, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineRight } from 'react-icons/ai';
import CircuitLeft from '#src/assets/certificates/circuit-left.svg';
import CircuitRight from '#src/assets/certificates/circuit-right.svg';
import { PageLayout } from '#src/components/page-layout.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { CourseCard } from '#src/patterns/course-card.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

interface CertificateDisplayProps {
  certificateId: string;
  isCourseWithSingleTrialExam?: boolean;
}

export const CertificateDisplay = ({
  certificateId,
  isCourseWithSingleTrialExam,
}: CertificateDisplayProps) => {
  const { courses } = useContext(AppContext);
  const { t } = useTranslation();

  const { data: userDetails, isFetched } = useQuery(
    trpc.user.courses.getUserDetailsByCertificateId.queryOptions({
      certificateId: certificateId,
      isCourseWithSingleTrialExam: isCourseWithSingleTrialExam ?? false,
    }),
  );
  if (!isFetched) {
    return <Loader size="s" />;
  }

  const userCourse = courses?.find(
    (course) => course.id === userDetails?.courseId,
  );
  const courseName = userCourse?.name;
  const username = userDetails?.displayName
    ? userDetails.displayName.charAt(0).toUpperCase() +
      userDetails.displayName.slice(1)
    : null;

  return (
    <PageLayout>
      <h2 className="text-center display-small-32px lg:display-large">
        {t('courses.exam.courseDiploma')}
      </h2>
      {username && courseName ? (
        <p className="text-center max-w-[848px] body-14px lg:label-large-20px mx-auto mt-9 lg:mt-20">
          {t('courses.exam.examCertificateCompletionText', {
            courseName,
            username,
          })}
        </p>
      ) : null}

      <div className="flex flex-col w-full items-center pt-4 pb-9 md:pt-10 md:pb-20 font-light md:font-normal lg:px-4 text-center lg:text-start">
        {/* Certificate with Circuits */}
        <div className="relative flex items-center justify-center w-full ">
          {/* Left Circuit */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block z-0">
            <img
              className="h-auto max-w-[795px] w-full"
              src={CircuitLeft}
              alt={t('imagesAlt.printedCircuits')}
              loading="lazy"
            />
          </div>

          {/* Certificate */}
          <div className="relative z-10 flex justify-center">
            <img
              src={`/api/files/${userDetails?.imgKey}`}
              alt="Certificate"
              className="w-full max-w-[842px] shadow-l-section"
            />
          </div>

          {/* Right Circuit */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block z-0">
            <img
              className="h-auto max-w-[795px] w-full"
              src={CircuitRight}
              alt={t('imagesAlt.printedCircuits')}
              loading="lazy"
            />
          </div>
        </div>

        {userCourse ? (
          <CourseSection course={userCourse} />
        ) : (
          <p>{t('courses.exam.courseNotFound')}</p>
        )}
      </div>
    </PageLayout>
  );
};

const CourseSection = ({ course }: { course: JoinedCourse }) => {
  const { courses: allCourses } = useContext(AppContext);
  const isScreenMd = useGreater('md');
  const buttonSize = isScreenMd ? 'l' : 'm';
  const { t } = useTranslation();

  if (!allCourses || allCourses.length === 0) {
    return null;
  }

  const selectedCourses = filterAndRandomizeCourses(course, allCourses);

  return (
    <section className="max-w-[1080px] mx-auto mt-7 lg:mt-28">
      <h2 className="text-white title-medium-sb-18px lg:display-semibold-40px text-center lg:text-start mb-5 md:mb-7">
        {t('courses.exam.certificatePageOtherCourses')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 justify-center">
        {selectedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <Link to={'/courses'} className="flex justify-center lg:justify-start">
        <Button
          variant="primary"
          rounded={false}
          className="mt-8"
          glowing={false}
          size={buttonSize}
        >
          {t('home.courseSection.checkAllCourses')}
          <span className="ml-3">
            <AiOutlineRight />
          </span>
        </Button>
      </Link>
    </section>
  );
};

export const filterAndRandomizeCourses = (
  currentCourse: JoinedCourse,
  allCourses: JoinedCourse[],
): JoinedCourse[] => {
  const language = currentCourse.language;

  if (!allCourses || allCourses.length === 0) {
    return [];
  }

  const otherCourses = allCourses.filter(
    (c) => c.id !== currentCourse.id && c.language === language,
  );

  if (otherCourses.length === 0) {
    return [];
  }

  const courseLevels = Object.values(CourseLevel);

  const sameTopicSameLevel = otherCourses.filter(
    (c) => c.topic === currentCourse.topic && c.level === currentCourse.level,
  );

  const differentTopicSameOrLowerLevel = otherCourses.filter(
    (c) =>
      c.topic !== currentCourse.topic &&
      courseLevels.indexOf(c.level) <=
        courseLevels.indexOf(currentCourse.level),
  );

  const sameTopicHigherLevel = otherCourses.filter(
    (c) =>
      c.topic === currentCourse.topic &&
      courseLevels.indexOf(c.level) > courseLevels.indexOf(currentCourse.level),
  );

  const pickRandom = (pool: JoinedCourse[]): JoinedCourse | null => {
    if (pool.length === 0) return null;
    const idx = Math.floor(Math.random() * pool.length);
    return pool.splice(idx, 1)[0];
  };

  const pool = [...otherCourses];
  const results: JoinedCourse[] = [];

  const randomSameTopicSameLevel = pickRandom(
    sameTopicSameLevel.length ? sameTopicSameLevel : pool,
  );
  if (randomSameTopicSameLevel) {
    results.push(randomSameTopicSameLevel);
  }

  const randomDifferentTopicSameOrLowerLevel = pickRandom(
    differentTopicSameOrLowerLevel.length
      ? differentTopicSameOrLowerLevel
      : pool,
  );
  if (randomDifferentTopicSameOrLowerLevel) {
    results.push(randomDifferentTopicSameOrLowerLevel);
  }

  const randomSameTopicHigherLevel = pickRandom(
    sameTopicHigherLevel.length ? sameTopicHigherLevel : pool,
  );
  if (randomSameTopicHigherLevel) {
    results.push(randomSameTopicHigherLevel);
  }

  return results;
};
