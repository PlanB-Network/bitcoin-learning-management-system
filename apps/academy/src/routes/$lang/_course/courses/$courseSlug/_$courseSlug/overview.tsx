import { NotificationType } from '@blms/constants';
import type { ScheduledCourseAnnouncement } from '@blms/types';
import { cn, TextTag } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoMdClose } from 'react-icons/io';
import { TbCalendarDown } from 'react-icons/tb';

import {
  CalendarDownloadModal,
  type CalenderEventType,
} from '#src/components/Calendar/calendar-download-modal.tsx';
import type { CalendarEvent } from '#src/components/Calendar/calendar-event.ts';
import { PageLayout } from '#src/components/page-layout.tsx';
import { CourseCurriculum } from '#src/patterns/course-curriculum.tsx';
import { AppContext } from '#src/providers/context.js';
import { CourseContext } from '#src/providers/courseContext.tsx';
import { EventCalendar } from '#src/routes/$lang/dashboard/-components/event-calendar.tsx';
import {
  getNotificationDateString,
  getNotificationIcon,
  getNotificationTitle,
} from '#src/routes/$lang/notifications/index.tsx';
import { copyCalendarUrl, downloadIcs } from '#src/utils/calendar.ts';
import { trpc } from '#src/utils/trpc.ts';
import { CourseTitle } from '../-components/course-title.tsx';
import { getTabs } from '../-utils/get-tabs.tsx';
import { SectionTitle } from './credits.tsx';

export const Route = createFileRoute(
  '/$lang/_course/courses/$courseSlug/_$courseSlug/overview',
)({
  component: Overview,
});

function Overview() {
  const { t, i18n } = useTranslation();

  const { course, courseProgress } = useContext(CourseContext);
  const { user } = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [icsFilters, setIcsFilters] = useState<CalenderEventType[]>(['class']);

  const { data: rawEvents } = useQuery(
    trpc.user.calendar.getCalendarEvents.queryOptions({
      upcomingEvents: false,
      userSpecific: true,
      language: i18n.language,
      courseId: course?.id,
    }),
  );

  const events = useMemo(() => {
    return (
      rawEvents?.map<CalendarEvent>((e) => ({
        addressLine1: e.addressLine1,
        end: e.endDate!,
        id: e.id,
        isOnline: e.isOnline,
        organizer: e.organizer,
        start: e.startDate!,
        subId: e.subId,
        title: e.name,
        type: e.type,
      })) ?? []
    );
  }, [rawEvents]);

  const completedChapters = courseProgress?.[0]?.chapters ?? [];

  const containsChapterStartDate = !!course?.parts.some((part) =>
    part.chapters.some((chapter) => chapter?.startDate != null),
  );

  const handleDownloadIcs = (modalFilters: CalenderEventType[]) => {
    downloadIcs({
      events: rawEvents ?? [],
      modalFilters,
      filename: `calendar-${course?.index}.ics`,
    });
  };

  const handleCopyCalendarUrl = async (modalFilters: CalenderEventType[]) => {
    return copyCalendarUrl({
      token: user?.calendarToken,
      modalFilters,
      language: i18n.language,
      courseId: course?.id,
      origin: window.location.origin,
    });
  };

  return (
    <PageLayout
      title={t('words.overview')}
      layoutSize="wide"
      overTitleMobile={course ? course.name : undefined}
      navbarTitle={course ? <CourseTitle course={course} /> : undefined}
      tabs={course ? getTabs(course, courseProgress?.[0]) : []}
    >
      {course && (
        <div className="flex flex-col w-full">
          <CourseAnnouncements courseId={course.id} />

          {containsChapterStartDate ? (
            <div className="flex flex-col gap-6 mt-6 course-overview">
              <div className="flex justify-between w-full items-center">
                <SectionTitle title={t('dashboard.course.courseCalendar')} />
                <button onClick={() => setIsModalOpen(true)} type="button">
                  <TbCalendarDown size={24} />
                </button>
              </div>
              <CourseCalendar events={events} />
              <CalendarDownloadModal
                isOpen={isModalOpen}
                onClose={setIsModalOpen}
                onDownload={handleDownloadIcs}
                onSubscribe={handleCopyCalendarUrl}
                filters={icsFilters}
                setFilters={setIcsFilters}
                eventTypes={['class']}
                showFilters={false}
              />
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
            <SectionTitle
              title={t('courses.details.curriculum')}
              className="mb-7 md:mb-6"
            />
          </CourseCurriculum>
        </div>
      )}
    </PageLayout>
  );
}

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
      <SectionTitle title={t('dashboard.course.announcement')} />
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

const CourseCalendar = ({ events }: { events: CalendarEvent[] }) => {
  return <EventCalendar events={events} />;
};
