import { Button, TextTag } from '@blms/ui';
import { t } from 'i18next';
import { useState } from 'react';
import { BiPencil } from 'react-icons/bi';
import { trpc } from '#src/utils/trpc.ts';
import { getNotificationIcon } from '../../notifications.tsx';
import { AnnouncementModal } from './announcement-modal.tsx';

export const CourseAnnouncements = ({ courseId }: { courseId: string }) => {
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const { data: courseNotifications } =
    trpc.user.notifications.getCourseNotifications.useQuery({ courseId });

  const publishedCourseNotifications = courseNotifications?.filter(
    (notification) => notification.isPublished,
  );
  const scheduledCourseNotifications = courseNotifications?.filter(
    (notification) => !notification.isPublished,
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

      <div className="flex flex-col border border-newGray-5 rounded-[12px] w-full mt-8">
        {scheduledCourseNotifications?.map((notification, index) => (
          <>
            <article key={notification.id} className="w-full flex items-center">
              <div className="flex flex-col gap-2.5 p-4">
                <div className="flex gap-3 items-center">
                  {getNotificationIcon(notification.type)}
                  <TextTag mode="light" size="verySmall" variant="grey">
                    {t(
                      `dashboard.teacher.courses.${notification.studentGroup}Students`,
                    )}
                  </TextTag>
                </div>
                <p className="body-14px">{notification.content}</p>
              </div>
            </article>
            {index < scheduledCourseNotifications.length - 1 && (
              <div className="h-px w-full bg-newGray-4" />
            )}
          </>
        ))}
      </div>

      <AnnouncementModal
        courseId={courseId}
        isOpen={isAnnouncementModalOpen}
        onClose={() => {
          setIsAnnouncementModalOpen(false);
          // refetch();
        }}
      />
    </div>
  );
};
