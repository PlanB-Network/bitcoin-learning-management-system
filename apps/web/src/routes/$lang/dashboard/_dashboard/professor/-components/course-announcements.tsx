import { Button } from '@blms/ui';
import { t } from 'i18next';
import { useState } from 'react';
import { BiPencil } from 'react-icons/bi';
import { AnnouncementModal } from './announcement-modal.tsx';

export const CourseAnnouncements = ({ courseId }: { courseId: string }) => {
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  return (
    <div className="flex flex-col text-dashboardSectionTitle w-full mt-3 lg:mt-8 max-w-[900px]">
      <h1 className="">
        {t('dashboard.teacher.courses.announcementsIntroduction')}
      </h1>
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
