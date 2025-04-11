import { Button } from '@blms/ui';
import { t } from 'i18next';
import { useState } from 'react';
import { BiPencil } from 'react-icons/bi';
import { AnnouncementModal } from './announcement-modal.tsx';

export const CourseAnnouncements = ({ courseId }: { courseId: string }) => {
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  return (
    <div className="flex flex-col text-dashboardSectionTitle w-full mt-3 lg:mt-10 max-w-[900px] gap-5 lb:gap-8">
      <h1 className="">
        {t('dashboard.teacher.courses.announcementsIntroduction')}
      </h1>
      <Button
        variant="primary"
        rounded={false}
        className="w-fit"
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
      <h2 className="text-dashboardSectionTitle title-medium-sb-18px lg:title-large-sb-24px">
        {t('dashboard.teacher.courses.announcementsUpcoming')}
      </h2>
      <p className="text-dashboardSectionText/75 body-14px lg:body-16px">
        {t('dashboard.teacher.courses.announcementsUpcomingDescription')}
      </p>

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
