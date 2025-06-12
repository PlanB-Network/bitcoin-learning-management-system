import type { ScheduledCourseAnnouncement } from '@blms/types';
import { BasicModal, Button, DialogClose, TextTag } from '@blms/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { Fragment, useState } from 'react';
import { BiPencil } from 'react-icons/bi';
import { FaRegTrashAlt } from 'react-icons/fa';
import InformationIcon from '#src/assets/icons/warning_orange.svg';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { formatTime } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';
import {
  getNotificationDateString,
  getNotificationIcon,
} from '../../notifications.tsx';
import { AnnouncementModal } from './announcement-modal.tsx';

export const CourseAnnouncements = ({ courseId }: { courseId: string }) => {
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] =
    useState<ScheduledCourseAnnouncement | null>(null);

  const { data: courseAnnouncements, refetch } = useQuery(
    trpc.user.notifications.getCourseAnnouncement.queryOptions({ courseId }),
  );

  const publishedCourseAnnouncements = courseAnnouncements
    ?.filter(
      (announcement) =>
        announcement.isPublished &&
        new Date(announcement.scheduledAt) >
          new Date(new Date().setMonth(new Date().getMonth() - 1)),
    )
    .sort((a, b) => {
      return (
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      );
    });

  const scheduledCourseAnnouncements = courseAnnouncements?.filter(
    (announcement) => !announcement.isPublished,
  );

  const deleteScheduledCourseAnnouncement = useMutation(
    trpc.user.notifications.deleteScheduledCourseAnnouncement.mutationOptions({
      onSuccess: () => {
        refetch();
      },
    }),
  );

  return (
    <div className="flex flex-col text-dashboardSectionTitle w-full mt-3 lg:mt-8 max-w-[900px]">
      <div className="flex flex-col w-full max-md:px-4">
        <p className="body-14px md:body-16px">
          {t('dashboard.teacher.courses.announcementsIntroduction')}
        </p>
        <Button
          variant="primary"
          rounded={false}
          className="w-fit mt-8"
          glowing={false}
          size={'m'}
          onClick={() => {
            setAnnouncementToEdit(null);
            setIsAnnouncementModalOpen(true);
          }}
        >
          {t('dashboard.teacher.courses.writeAnnouncement')}
          <span className="ml-3">
            <BiPencil size={24} />
          </span>
        </Button>
        <h2 className="text-dashboardSectionTitle title-medium-sb-18px lg:title-large-sb-24p mt-8">
          {t('dashboard.teacher.courses.announcementsUpcoming')}
        </h2>
        <p className="text-dashboardSectionText/75 body-14px lg:body-16px mt-4">
          {t('dashboard.teacher.courses.announcementsUpcomingDescription')}
        </p>
      </div>

      {scheduledCourseAnnouncements &&
      scheduledCourseAnnouncements.length > 0 ? (
        <div className="flex flex-col border border-newGray-5 rounded-[12px] w-full mt-8">
          {scheduledCourseAnnouncements?.map((announcement, index) => (
            <Fragment key={announcement.id}>
              <article className="w-full flex max-md:flex-col md:items-center justify-between p-4">
                <div className="flex flex-col gap-2.5 md:p-4">
                  <div className="flex gap-3 items-center">
                    {getNotificationIcon(announcement.type)}
                    <TextTag mode="light" size="verySmall" variant="grey">
                      {t(
                        `dashboard.teacher.courses.${announcement.studentGroup}Students`,
                      )}
                    </TextTag>
                    <span className="ml-auto flex items-center md:hidden desktop-caption1 text-newBlack-5">
                      {new Intl.DateTimeFormat(undefined, {
                        day: 'numeric',
                        month: 'long',
                      }).format(announcement.scheduledAt)}{' '}
                      {formatTime(
                        announcement.scheduledAt,
                        announcement.timezone,
                      )}
                    </span>
                  </div>
                  <p className="body-14px whitespace-pre-line">
                    {announcement.content}
                  </p>
                </div>
                <div className="flex gap-3 items-center max-md:mt-2.5">
                  <div className="flex flex-col items-center md:p-4 w-[140px] shrink-0 text-center body-14px max-md:hidden">
                    <span>
                      {new Intl.DateTimeFormat(undefined, {
                        day: 'numeric',
                        month: 'long',
                      }).format(announcement.scheduledAt)}
                    </span>
                    <span>
                      {formatTime(
                        announcement.scheduledAt,
                        announcement.timezone,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 md:px-3">
                    <Button
                      variant="primary"
                      size="s"
                      mode="dark"
                      onClick={() => {
                        setAnnouncementToEdit(announcement);
                        setIsAnnouncementModalOpen(true);
                      }}
                    >
                      {t('words.edit')}
                    </Button>
                    <DeleteAnnouncementDialog
                      onConfirm={() => {
                        deleteScheduledCourseAnnouncement.mutate({
                          id: announcement.id,
                        });
                      }}
                    />
                  </div>
                </div>
              </article>
              {index < scheduledCourseAnnouncements.length - 1 && (
                <div className="h-px w-full bg-newGray-4" />
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <p className="mt-8 subtitle-small-caps-14px text-newGray-1 max-md:px-4">
          {t('dashboard.teacher.courses.noWrittenAnnouncement')}
        </p>
      )}

      <div className="flex flex-col w-full max-md:px-4">
        <h2 className="text-dashboardSectionTitle title-medium-sb-18px lg:title-large-sb-24p mt-8">
          {t('dashboard.teacher.courses.announcementsPast')}
        </h2>
        <p className="text-dashboardSectionText/75 body-14px lg:body-16px mt-4">
          {t('dashboard.teacher.courses.announcementsPastDescription')}
        </p>
      </div>

      {publishedCourseAnnouncements &&
      publishedCourseAnnouncements.length > 0 ? (
        <div className="flex flex-col border border-newGray-5 rounded-[12px] w-full mt-8 overflow-hidden bg-black/5">
          {publishedCourseAnnouncements.map((announcement, index) => (
            <Fragment key={announcement.id}>
              <article className="w-full flex flex-col px-4 max-md:py-1.5 md:py-4">
                <div className="flex gap-3 items-center">
                  {getNotificationIcon(announcement.type)}
                  <TextTag mode="light" size="verySmall" variant="grey">
                    {t(
                      `dashboard.teacher.courses.${announcement.studentGroup}Students`,
                    )}
                  </TextTag>
                  <span className="flex ml-auto justify-center md:w-[140px] shrink-0 text-center desktop-caption1 text-newBlack-5">
                    {getNotificationDateString(announcement.scheduledAt)}
                  </span>
                </div>
                <p className="body-14px mt-[5px] md:mt-2.5">
                  {announcement.content}
                </p>
              </article>
              {index < publishedCourseAnnouncements.length - 1 && (
                <div className="h-px w-full bg-newGray-4" />
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <p className="mt-8 subtitle-small-caps-14px text-newGray-1 max-md:px-4">
          {t('dashboard.teacher.courses.noPastAnnouncement')}
        </p>
      )}

      <AnnouncementModal
        courseId={courseId}
        isOpen={isAnnouncementModalOpen}
        onClose={() => {
          setIsAnnouncementModalOpen(false);
          refetch();
        }}
        existingAnnouncement={announcementToEdit ?? undefined}
      />
    </div>
  );
};

const DeleteAnnouncementDialog = ({ onConfirm }: { onConfirm: () => void }) => {
  const isMobile = useSmaller('md');

  return (
    <BasicModal
      trigger={
        <Button variant="outline" size="s" mode="light">
          <FaRegTrashAlt />
        </Button>
      }
      title={t('dashboard.teacher.courses.deleteAnnouncementTitle')}
      content={
        <p>{t('dashboard.teacher.courses.deleteAnnouncementWarning')}</p>
      }
      iconSrc={InformationIcon}
    >
      <div className="!flex gap-4 md:!gap-[30px]">
        <DialogClose asChild>
          <Button
            variant="primary"
            size={isMobile ? 'm' : 'l'}
            className="!w-fit"
            onClick={onConfirm}
          >
            {t('words.delete')}
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="outline"
            size={isMobile ? 'm' : 'l'}
            className="w-fit"
          >
            {t('words.cancel')}
          </Button>
        </DialogClose>
      </div>
    </BasicModal>
  );
};
