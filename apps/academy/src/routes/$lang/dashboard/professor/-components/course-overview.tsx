import type { CourseActivity, CourseResponse } from '@blms/types';
import {
  Banner,
  BannerTitle,
  Button,
  cn,
  DashGauge,
  ListItem,
  RadialGauge,
  TextTag,
} from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TbCalendar,
  TbChevronDown,
  TbCircleCheck,
  TbClock,
  TbExternalLink,
  TbMapPin,
  TbMessage,
  TbNumber,
  TbSchool,
  TbSpeakerphone,
  TbStar,
} from 'react-icons/tb';
import Check from '#src/assets/icons/check_green.svg?react';
import SandClockIcon from '#src/assets/icons/sandClock/sand clock_bottom.svg?react';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { getNotificationDateString } from '#src/routes/$lang/notifications/index.tsx';
import { formatDate, formatHourRange } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';
import { SELF_PACED_PASSING_THRESHOLD } from './exam-results.tsx';

export const CourseOverview = ({ course }: { course: CourseResponse }) => {
  return (
    <div className="flex flex-col text-dashboardSectionTitle w-full">
      <CourseStatusBanner course={course} />
      <OverallPerformance course={course} />
      <UpcomingClass course={course} />
      <CourseRecentActivity courseId={course.id} />
    </div>
  );
};

const CourseStatusBanner = ({ course }: { course: CourseResponse }) => {
  const { t } = useTranslation();
  const now = new Date();

  if (course.teachingFormat !== 'professor_led') {
    return null;
  }

  if (course.startDate && course.startDate > now) {
    return (
      <Banner
        variant="inprogress"
        icon={<SandClockIcon className="size-9 fill-brown-500" />}
      >
        <BannerTitle>
          {t('dashboard.professor.courses.overview.courseNotStarted')}
        </BannerTitle>
      </Banner>
    );
  }

  if (course.endDate && course.endDate < now) {
    return (
      <Banner variant="success" icon={<Check className="size-9" />}>
        <BannerTitle>
          {t('dashboard.professor.courses.overview.courseEnded')}
        </BannerTitle>
      </Banner>
    );
  }

  return null;
};

const OverallPerformance = ({ course }: { course: CourseResponse }) => {
  const { t } = useTranslation();
  const isMobile = useSmaller('md');

  const isSelfPacedCourse = course?.teachingFormat === 'self_paced';
  const isProfessorLedCourse = course?.teachingFormat === 'professor_led';

  const singleTrialExams =
    course?.parts.flatMap((p) =>
      p.chapters.filter((c) => c?.isSingleTrialExam),
    ) || [];

  const multiAttemptExams =
    course?.parts.flatMap((p) => p.chapters.filter((c) => c?.isCourseExam)) ||
    [];

  const hasAssignment = course?.hasAssignment ?? false;

  const { data: enrolledStudentsCount } = useQuery(
    trpc.user.courses.getEnrolledStudentsCount.queryOptions(
      {
        courseId: course.id,
      },
      { enabled: !!course.id },
    ),
  );

  const { data: teacherLedCourseGradesAndSummary } = useQuery(
    trpc.user.courses.getTeacherLedCourseGrades.queryOptions(
      {
        courseId: course.id,
        passingThreshold: course?.passingGradeThreshold ?? 0,
      },
      {
        enabled:
          !!course &&
          isProfessorLedCourse &&
          (singleTrialExams.length > 0 || hasAssignment),
      },
    ),
  );

  const { data: selfPacedCourseGradesAndSummary } = useQuery(
    trpc.user.courses.getMultiAttemptExamCourseGrades.queryOptions(
      {
        courseId: course.id,
        passingThreshold: SELF_PACED_PASSING_THRESHOLD,
      },
      {
        enabled: !!course && isSelfPacedCourse && multiAttemptExams.length > 0,
      },
    ),
  );

  const courseInfos = {
    graduatedStudents:
      (isProfessorLedCourse
        ? teacherLedCourseGradesAndSummary?.graduatedStudentsAmount
        : selfPacedCourseGradesAndSummary?.graduatedStudentsAmount) || 0,
    totalStudents: enrolledStudentsCount,
    averageRating: course?.averageRating,
  };

  return (
    <section className="flex flex-col items-center mt-6 border border-neutral-100 bg-white rounded-2xl">
      <h3 className="px-6 py-3 text-neutral-1000 label-18px max-md:font-medium md:title-large-sb-24px">
        {t('dashboard.professor.courses.overview.overallPerformance')}
      </h3>
      <div className="flex justify-center max-md:max-w-[286px] flex-wrap gap-2">
        {/* Enrolled students */}
        {courseInfos.totalStudents && courseInfos.totalStudents > 0 ? (
          <div className="flex flex-col items-center text-blue-500 self-end justify-center w-full max-w-54 md:max-w-[336px] py-5 md:px-14 md:py-7">
            <span className="max-md:title-large-sb-24px md:text-[44px] md:font-bold !leading-none">
              {courseInfos.totalStudents}
            </span>
            <span className="subtitle-medium-med-16px md:text-[22px] md:tracking-015px md:font-semibold pt-5 text-center">
              {t('dashboard.professor.courses.overview.enrolledStudents')}
            </span>
          </div>
        ) : null}

        {/* Graduated students */}
        {courseInfos.totalStudents &&
        courseInfos.totalStudents > 0 &&
        (isProfessorLedCourse ? course?.areScoresCalculated : true) ? (
          <DashGauge
            total={courseInfos.totalStudents}
            completed={courseInfos.graduatedStudents}
            label={t('dashboard.teacher.courses.studentsGraduated')}
            variant="orange"
            size={isMobile ? 'm' : 'l'}
          />
        ) : null}

        {/* Rating */}
        {courseInfos.averageRating && courseInfos.averageRating > 0 ? (
          <RadialGauge
            value={Math.round(courseInfos.averageRating * 100) / 100}
            total={5}
            label={t('words.rating')}
            variant="green"
            size={isMobile ? 'm' : 'l'}
          />
        ) : null}
      </div>
    </section>
  );
};

const UpcomingClass = ({ course }: { course: CourseResponse }) => {
  const { t } = useTranslation();
  const isMobile = useSmaller('md');

  const [isExpanded, setIsExpanded] = useState(true);
  const now = new Date();

  const futureChapters = course.parts
    .flatMap((part) => part.chapters)
    .filter((chapter) => {
      return chapter.startDate && new Date(chapter.startDate) > now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.startDate!);
      const dateB = new Date(b.startDate!);
      return dateA.getTime() - dateB.getTime();
    });

  const nextChapter = futureChapters[0];

  const { data: chapterAttendance } = useQuery(
    trpc.user.courses.getUserChapterAttendance.queryOptions(
      {
        chapterId: nextChapter?.chapterId,
      },
      { enabled: !!nextChapter },
    ),
  );

  if (
    course.teachingFormat !== 'professor_led' ||
    futureChapters.length === 0
  ) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section className="w-full flex flex-col gap-4 py-2 mt-6">
      <h3 className="md:p-2 mobile-h3 md:subtitle-large-med-20px text-neutral-1000">
        {t('dashboard.professor.courses.overview.upcomingClass')}
      </h3>

      <article className="bg-neutral-50 rounded-2xl overflow-hidden w-full">
        <header
          className={cn(
            'p-4 md:px-6 md:py-3 border-b border-neutral-100 flex justify-between items-center cursor-pointer transition-colors',
            !isExpanded && 'border-b-0',
          )}
          onClick={!isMobile ? toggleExpanded : undefined}
        >
          <h4 className="label-med-18px font-medium md:label-large-med-20px text-neutral-1000">
            {nextChapter.partIndex}.{nextChapter.chapterIndex}.{' '}
            {nextChapter.title}
          </h4>

          <TbChevronDown
            className={`max-md:hidden text-neutral-1000 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            size={24}
          />
        </header>

        {isExpanded && (
          <div className="p-3 md:p-6 flex max-md:flex-col gap-4 md:gap-7 w-full">
            <section className="flex flex-col gap-2 w-full">
              <h5 className="text-neutral-800 font-medium md:px-1">
                {t('words.info')}
              </h5>
              <div className="flex flex-col w-full p-5 bg-white rounded-2xl [&>*:not(:last-child)]:border-b">
                {nextChapter.startDate && (
                  <ListItem
                    leftText={t('words.date')}
                    rightText={formatDate(nextChapter.startDate)}
                    icon={<TbCalendar size={isMobile ? 16 : 24} />}
                    variant="grey"
                    wrapOnMobile
                  />
                )}

                {nextChapter.startDate && (
                  <ListItem
                    leftText={t('words.time')}
                    rightText={formatHourRange(
                      nextChapter.startDate,
                      nextChapter.endDate || undefined,
                      nextChapter.timezone || undefined,
                      true,
                    )}
                    icon={<TbClock size={isMobile ? 16 : 24} />}
                    variant="grey"
                    wrapOnMobile
                  />
                )}

                {(nextChapter.addressLine1 ||
                  nextChapter.addressLine2 ||
                  nextChapter.addressLine3) && (
                  <ListItem
                    leftText={t('words.location')}
                    rightText={
                      <div className="flex flex-col md:items-end">
                        {[
                          nextChapter.addressLine1,
                          nextChapter.addressLine2,
                          nextChapter.addressLine3,
                        ]
                          .filter(Boolean)
                          .map((line, index) => (
                            <span key={`address-line-${index}-${line}`}>
                              {line}
                            </span>
                          ))}
                      </div>
                    }
                    icon={<TbMapPin size={isMobile ? 16 : 24} />}
                    variant="grey"
                    wrapOnMobile
                  />
                )}
              </div>
            </section>

            {(course.format === 'hybrid' || course.format === 'inperson') && (
              <section className="flex flex-col gap-2 w-full">
                <h5 className="text-neutral-800 font-medium md:px-1">
                  {t('words.students')}
                </h5>

                <div className="flex flex-col w-full p-5 bg-white rounded-2xl [&>*:not(:last-child)]:border-b">
                  {chapterAttendance && (
                    <>
                      <ListItem
                        leftText={t(
                          'dashboard.professor.courses.overview.studentsRegistered',
                        )}
                        rightText={chapterAttendance.length}
                        icon={<TbNumber size={isMobile ? 16 : 24} />}
                        variant="grey"
                        wrapOnMobile
                      />
                      <ListItem
                        leftText={t(
                          'dashboard.professor.courses.overview.attendanceList',
                        )}
                        rightText={
                          <button
                            className="text-orange-500 flex items-center gap-1"
                            onClick={() =>
                              handleDownload(
                                chapterAttendance,
                                nextChapter.title,
                              )
                            }
                            type="button"
                          >
                            {t(
                              'dashboard.professor.courses.overview.attendanceList',
                            )}
                            <TbExternalLink size={isMobile ? 16 : 24} />
                          </button>
                        }
                        icon={<TbCalendar size={isMobile ? 16 : 24} />}
                        variant="grey"
                        wrapOnMobile
                      />
                    </>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </article>

      <div className="flex items-center justify-between p-2 max-md:flex-col max-md:gap-4">
        <span className="flex items-center md:p-2 gap-2 md:gap-4 max-md:body-medium-12px">
          <TbSpeakerphone size={24} className="text-neutral-400" />
          {t('dashboard.professor.courses.overview.notifyStudents')}
        </span>
        <Button variant="primary" size={'m'} asChild>
          <Link
            to={`/dashboard/professor/manage-courses/${course.id}/announcement`}
          >
            {t('dashboard.professor.courses.overview.announceChange')}
          </Link>
        </Button>
      </div>
    </section>
  );
};

const CourseRecentActivity = ({ courseId }: { courseId: string }) => {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(5);

  const { data: courseActivity } = useQuery(
    trpc.user.courses.getCourseRecentActivity.queryOptions({
      courseId,
    }),
  );

  if (!courseActivity || courseActivity.length === 0) {
    return null;
  }

  const displayedActivity = courseActivity.slice(0, visibleCount);
  const hasMoreItems = courseActivity.length > visibleCount;

  return (
    <section className="flex flex-col w-full mt-6 gap-2">
      <h3 className="md:p-2 mobile-h3 md:subtitle-large-med-20px text-neutral-1000">
        {t('dashboard.professor.courses.overview.recentActivity')}
      </h3>
      <ul
        className="bg-white rounded-2xl border border-neutral-100
        [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-neutral-100"
      >
        {displayedActivity.map((activity, index) => (
          <ActivityItem
            key={`${activity.type}-${activity.date}-${index}`}
            activity={activity}
          />
        ))}
      </ul>
      {hasMoreItems && (
        <div className="p-2 max-md:mx-auto">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((prev) => prev + 10)}
          >
            {t('words.viewMore')}
          </Button>
        </div>
      )}
    </section>
  );
};

const ActivityItem = ({ activity }: { activity: CourseActivity }) => {
  const { t } = useTranslation();
  const { displayName, score, type, withComment } = activity;
  const translationKey = getActivityText(activity);

  return (
    <li className="flex max-md:flex-col md:items-center justify-between px-4 py-1.5 md:p-4 max-md:gap-1.5">
      <span className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center justify-between gap-1.5 max-md:w-full">
          <div className="flex items-center gap-2 py-1">
            <ActivityIcon type={type} withComment={withComment} />
            <TextTag size="small" variant="grey" mode="light">
              {displayName}
            </TextTag>
          </div>
          <span className="text-center text-neutral-600 desktop-caption1 w-fit lowercase md:hidden">
            {getNotificationDateString(activity.date)}
          </span>
        </div>
        <span className="body-14px text-neutral-1000 max-md:hidden">
          {t(translationKey, { score })}
        </span>
      </span>
      <span className="text-center text-neutral-600 desktop-caption1 w-36 lowercase max-md:hidden">
        {getNotificationDateString(activity.date)}
      </span>
      <span className="body-14px text-neutral-1000 md:hidden">
        {t(translationKey, { score })}
      </span>
    </li>
  );
};

const ICONS = {
  enrolled: TbSchool,
  graduated: TbCircleCheck,
  reviewWithComment: TbMessage,
  review: TbStar,
};

const ActivityIcon = ({
  type,
  withComment,
}: {
  type: CourseActivity['type'];
  withComment: boolean;
}) => {
  const isMobile = useSmaller('md');

  const IconComponent =
    ICONS[type === 'review' && withComment ? 'reviewWithComment' : type];
  return (
    <IconComponent
      className="text-neutral-1000 shrink-0"
      size={isMobile ? 18 : 24}
    />
  );
};

const convertToCSV = (participants: string[]) => {
  const header = ['Index', 'Display Name'].join(',');

  const rows = participants.map((row, index) =>
    [index + 1, row || ''].map((value) => `"${value}"`).join(','),
  );

  return [header, ...rows].join('\n');
};

const handleDownload = (participants: string[], chapterName: string) => {
  if (!participants || participants.length === 0) {
    alert('There are no participants for this event');
    return;
  }

  const csvData = convertToCSV(participants);
  const blob = new Blob([csvData], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);

  const sanitizedEventName = chapterName
    .replaceAll(/[^\da-z]/gi, '_')
    .toLowerCase();
  const filename = `${sanitizedEventName}_participants.csv`;
  link.download = filename;
  link.click();
};

const getActivityText = (activity: CourseActivity) => {
  const { type, withComment } = activity;

  const keys = {
    enrolled: 'dashboard.professor.courses.overview.hasEnrolled',
    graduated: 'dashboard.professor.courses.overview.hasGraduated',
    review: withComment
      ? 'dashboard.professor.courses.overview.hasLeftReviewAndComment'
      : 'dashboard.professor.courses.overview.hasLeftReview',
  };

  return keys[type];
};
