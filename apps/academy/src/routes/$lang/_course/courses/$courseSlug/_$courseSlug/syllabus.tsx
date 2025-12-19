import { NotificationType } from '@blms/constants';
import type {
  CourseProgressExtended,
  ScheduledCourseAnnouncement,
} from '@blms/types';
import { ButtonWithArrow, cn, Divider, TextTag } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoMdClose } from 'react-icons/io';
import { AuthorCard } from '#src/components/author-card.tsx';
import type { CalendarEvent } from '#src/components/Calendar/calendar-event.ts';
import { PageLayout } from '#src/components/page-layout.tsx';
import { ProfessorCardReduced } from '#src/components/professor-card.tsx';
import { CourseCurriculum } from '#src/patterns/course-curriculum.tsx';
import { CourseContext } from '#src/providers/courseContext.tsx';
import { ProgressBar } from '#src/routes/$lang/dashboard/_dashboard/-components/courses-progress-list.tsx';
import { EventCalendar } from '#src/routes/$lang/dashboard/_dashboard/-components/event-calendar.tsx';
import {
  getNotificationDateString,
  getNotificationIcon,
  getNotificationTitle,
} from '#src/routes/$lang/notifications/index.tsx';
import { trpc } from '#src/utils/trpc.ts';
import { CourseTitle } from '../-components/course-title.tsx';
import { getTabs } from '../-utils/get-tabs.tsx';

export const Route = createFileRoute(
  '/$lang/_course/courses/$courseSlug/_$courseSlug/syllabus',
)({
  component: Syllabus,
});

function Syllabus() {
  const { t } = useTranslation();

  const { course, courseProgress } = useContext(CourseContext);

  const completedChapters = courseProgress?.[0]?.chapters ?? [];

  const containsChapterStartDate = !!course?.parts.some((part) =>
    part.chapters.some((chapter) => chapter?.startDate != null),
  );

  return (
    <PageLayout
      title={t('words.syllabus')}
      hideTitle
      layoutSize="max"
      overTitle={course ? <CourseTitle course={course} /> : undefined}
      tabs={course ? getTabs(course, courseProgress?.[0]) : []}
    >
      {course && (
        <div className="flex flex-col w-fit">
          {courseProgress &&
            courseProgress.length > 0 &&
            courseProgress[0].progressPercentage < 100 && (
              <>
                <span className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle mt-4 md:mt-10">
                  {t('dashboard.myCourses.whereYouAre')}
                </span>

                <CourseProgress courseProgress={courseProgress[0]} />
              </>
            )}

          <CourseAnnouncements courseId={course.id} />

          {containsChapterStartDate ? (
            <div className="flex flex-col gap-6 mt-6 text-xl course-overview">
              <h3 className="subtitle-large-med-20px text-neutral-1000">
                {t('dashboard.course.courseCalendar')}
              </h3>
              <CourseCalendar courseId={course.id} />
            </div>
          ) : null}
          <CourseCurriculum
            course={course}
            completedChapters={completedChapters.map(
              (chapter) => chapter.chapterId,
            )}
            nextChapter={courseProgress?.[0]?.nextChapter?.chapterId}
            hideGithubLink
            className="self-start mt-7 md:mt-10 w-full"
          >
            <h4 className="subtitle-small-caps-14px md:subtitle-medium-caps-18px text-orange-500 mb-7 md:mb-6">
              {t('courses.details.curriculum')}
            </h4>
          </CourseCurriculum>

          <Divider className="my-6 md:my-9" width="w-full" />

          <section className="flex flex-col md:gap-5">
            <h4 className="title-small-med-16px md:title-large-sb-24px text-dashboardSectionTitle">
              {course.associatedProfessors.length > 0
                ? t('words.professors')
                : t('words.professor')}
            </h4>
            <div className="flex h-fit flex-col max-md:gap-4">
              {course.associatedProfessors.length > 0 ? (
                <span className="uppercase text-orange-500 text-lg">
                  {t('dashboard.course.coordinator')}
                </span>
              ) : null}
              {course.mainProfessors.map((professor) => (
                <AuthorCard
                  key={professor.id}
                  professor={professor}
                  hasDonateButton
                />
              ))}
            </div>
            {course.associatedProfessors.length > 0 ? (
              <div className="flex h-fit flex-col">
                <span className="max-md:mt-6 uppercase text-orange-500 text-lg ">
                  {t('courses.details.associatedProfessors')}
                </span>
                <div className="mt-6 flex flex-row flex-wrap gap-6 max-md:justify-center">
                  {course.associatedProfessors.map((professor) => (
                    <ProfessorCardReduced
                      key={professor.id}
                      professor={professor}
                      hasDonateButton
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </PageLayout>
  );
}

const CourseProgress = ({
  courseProgress,
}: {
  courseProgress: CourseProgressExtended;
}) => {
  const { t } = useTranslation();

  return (
    <div
      key={courseProgress.courseId}
      className="rounded-lg md:rounded-[20px] md:p-1.5 xl:p-2.5 max-md:border max-md:border-neutral-100 shadow-course-navigation-sm md:shadow-course-navigation bg-white md:bg-neutral-50 w-full max-w-[1082px] mt-2.5 md:mt-10"
    >
      <div className="flex max-md:flex-col md:items-center md:justify-between md:gap-4 p-2 md:p-3 xl:p-5">
        <div className="flex justify-between items-center w-full md:w-[105px] md:shrink-0 max-md:mb-5">
          <span className="mobile-subtitle1 md:hidden">
            {courseProgress.courseIndex.toUpperCase()}
          </span>
          <span className="max-md:hidden text-xl">{t('words.progress')}</span>
          <span className="mobile-subtitle1 text-orange-500 md:hidden">
            {courseProgress.progressPercentage}%
          </span>
        </div>

        <ProgressBar
          courseCompletedChapters={courseProgress.completedChaptersCount}
          courseTotalChapters={courseProgress.totalChapters}
        />
        <span className="text-xl font-medium text-orange-500 leading-normal w-13 shrink-0 text-end max-md:hidden">
          {courseProgress.progressPercentage}%
        </span>
        <div
          className={cn(
            courseProgress.progressPercentage === 100 ? 'hidden' : '',
          )}
        >
          <Link
            to={'/courses/$courseId/$chapterId'}
            params={{
              chapterId: courseProgress.nextChapter?.chapterId as string,
              courseId: courseProgress.courseId,
            }}
          >
            <ButtonWithArrow variant="outline" size="s">
              {t('dashboard.myCourses.resumeLesson')}
            </ButtonWithArrow>
          </Link>
        </div>
      </div>
    </div>
  );
};

const CourseAnnouncements = ({ courseId }: { courseId: string }) => {
  const { t } = useTranslation();
  const { data: publishedCourseAnnouncements } = useQuery(
    trpc.user.notifications.getPublishedScheduledCourseAnnouncements.queryOptions(
      {
        courseId,
      },
    ),
  );

  const [courseAnnouncements, setCourseAnnouncements] = useState<
    ScheduledCourseAnnouncement[]
  >([]);

  useEffect(() => {
    if (
      publishedCourseAnnouncements &&
      publishedCourseAnnouncements.length >= 0
    ) {
      setCourseAnnouncements(
        publishedCourseAnnouncements
          ?.filter((announcement) => announcement.courseId === courseId)
          .filter(
            (announcement) =>
              announcement.type === NotificationType.Assignment ||
              announcement.type === NotificationType.Calendar ||
              announcement.type === NotificationType.Warning ||
              announcement.type === NotificationType.General ||
              announcement.type === NotificationType.Celebration,
          )
          .filter(
            (announcement) =>
              new Date(announcement.scheduledAt).getTime() >
              Date.now() - 7 * 24 * 60 * 60 * 1000,
          )
          .sort(
            (a, b) =>
              new Date(b.scheduledAt).getTime() -
              new Date(a.scheduledAt).getTime(),
          ),
      );
    }
  }, [publishedCourseAnnouncements, courseId]);

  if (!courseAnnouncements || courseAnnouncements.length === 0) {
    return null;
  }

  return (
    <section className="w-full flex flex-col gap-5 mt-8">
      <h3 className="subtitle-large-med-20px text-neutral-1000">
        {t('dashboard.course.announcement')}
      </h3>
      <div className="flex flex-col rounded-[12px] border-neutral-100 border overflow-hidden">
        {courseAnnouncements.map((announcement, index) => (
          <CourseAnnouncementItem
            key={announcement.id}
            announcement={announcement}
            courseAnnouncements={courseAnnouncements}
            setCourseAnnouncements={setCourseAnnouncements}
            lastAnnouncement={index === courseAnnouncements.length - 1}
          />
        ))}
      </div>
    </section>
  );
};

const CourseAnnouncementItem = ({
  announcement,
  lastAnnouncement,
  courseAnnouncements,
  setCourseAnnouncements,
}: {
  announcement: ScheduledCourseAnnouncement;
  lastAnnouncement: boolean;
  courseAnnouncements: ScheduledCourseAnnouncement[];
  setCourseAnnouncements: (
    courseAnnouncements: ScheduledCourseAnnouncement[],
  ) => void;
}) => {
  return (
    <div key={announcement.id} className="relative flex flex-col">
      <article
        className={cn(
          'group flex w-full hover:bg-orange-50 hover:border-orange-400 hover:border-l-2 py-1.5 px-4 md:p-4',
        )}
      >
        <div className="flex flex-col gap-2.5 md:px-4 grow">
          <div className="flex justify-between items-center max-md:min-h-8">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="rounded-full size-2 bg-orange-500 md:hidden ml-1.5" />
              {getNotificationIcon(
                announcement.type,
                'size-[18px] md:size-6 text-orange-600',
              )}
              <TextTag size="small" variant="orange" mode="light100">
                {getNotificationTitle(
                  announcement.type,
                  announcement.courseId ?? undefined,
                )}
              </TextTag>
            </div>
            <div className="rounded-full size-2 bg-orange-500 max-md:hidden" />
            <span className="px-4 shrink-0 text-center lowercase desktop-caption1 text-neutral-600 md:hidden">
              {getNotificationDateString(new Date(announcement.scheduledAt))}
            </span>
          </div>
          <p className="body-14px text-neutral-1000 whitespace-pre-line">
            {announcement.content}
          </p>
        </div>
        <span className="px-4 w-35 shrink-0 text-center lowercase desktop-caption1 text-neutral-600 max-md:hidden">
          {getNotificationDateString(new Date(announcement.scheduledAt))}
        </span>
        <button
          type="button"
          onClick={() => {
            setCourseAnnouncements(
              courseAnnouncements.filter((item) => item.id !== announcement.id),
            );
          }}
          className="pl-2 pr-4 self-start max-md:hidden"
        >
          <IoMdClose size={20} />
        </button>
      </article>
      {!lastAnnouncement && <div className="h-px w-full bg-neutral-200" />}
    </div>
  );
};

const CourseCalendar = ({ courseId }: { courseId: string }) => {
  const { data: events } = useQuery(
    trpc.user.calendar.getCalendarEvents.queryOptions(
      { upcomingEvents: true, userSpecific: true },
      {
        select: (allEvents) =>
          allEvents
            ?.filter((e) => e.id === courseId)
            .map<CalendarEvent>((e) => ({
              addressLine1: e.addressLine1,
              end: e.endDate!,
              id: e.id,
              isOnline: e.isOnline,
              organizer: e.organizer,
              start: e.startDate!,
              subId: e.subId,
              title: e.name,
              type: e.type,
            })),
      },
    ),
  );

  return <EventCalendar events={events ?? []} />;
};
