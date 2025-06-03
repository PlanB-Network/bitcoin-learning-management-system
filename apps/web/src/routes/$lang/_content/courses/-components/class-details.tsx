import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDownload, FiLoader } from 'react-icons/fi';

import type { CourseChapterResponse, CourseResponse } from '@blms/types';
import { BasicModal, Button, DialogClose } from '@blms/ui';

import { AppContext } from '#src/providers/context.js';
import { formatDate, formatHourRange } from '#src/utils/date.js';
import { trpc } from '#src/utils/trpc.js';

import InformationIcon from '#src/assets/icons/warning_orange.svg';

import {
  MdAccessTime,
  MdOutlineCalendarMonth,
  MdOutlineLocationOn,
} from 'react-icons/md';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { CourseBookModal } from './book-modal/course-book-modal.tsx';

import { base64ToBlob } from '#src/utils/misc.ts';

interface ClassDetailsProps {
  course: CourseResponse;
  chapter: CourseChapterResponse;
  professor: string;
}

export const ClassDetails = ({
  course,
  chapter,
  professor,
}: ClassDetailsProps) => {
  const isMobile = useSmaller('md');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [downloadedPdf, setDownloadedPdf] = useState('');

  const { t } = useTranslation();

  const { mutateAsync: downloadTicketMutateAsync, isPending } =
    trpc.user.courses.downloadChapterTicket.useMutation();

  const { data: userChapters, refetch: refetchUserChapter } =
    trpc.user.courses.getUserChapter.useQuery({
      courseId: course.id,
    });

  const userChapter = userChapters?.find(
    (uc) => uc.chapterId === chapter.chapterId && uc.booked === true,
  );

  const { user } = useContext(AppContext);

  const saveUserChapterRequest =
    trpc.user.courses.saveUserChapter.useMutation();

  const cancelBooking = useCallback(async () => {
    await saveUserChapterRequest.mutateAsync({
      courseId: course.id,
      chapterId: chapter.chapterId,
      booked: false,
    });
    refetchUserChapter();
  }, [chapter, course.id, refetchUserChapter, saveUserChapterRequest]);

  const timezone = chapter.timezone ? chapter.timezone : undefined;

  const formattedStartDate = chapter.startDate
    ? formatDate(chapter.startDate)
    : '';

  const formattedTime =
    chapter.startDate && chapter.endDate
      ? `${formatHourRange(chapter.startDate, chapter.endDate, timezone)}`
      : '';

  return (
    <section className="flex flex-col gap-4 w-full md:max-w-[1102px] mt-4 md:mt-8 px-5 md:px-2">
      <span className="subtitle-small-caps-14px md:subtitle-medium-caps-18px text-newBlack-1">
        {t('courses.chapter.detail.title')}
      </span>
      <article className="flex flex-col justify-center p-4 gap-5 self-stretch rounded-[12px] bg-newGray-6 shadow-course-navigation-sm body-14px md:label-normal-16px">
        <div className="w-full flex max-md:flex-col gap-4 md:gap-2.5 text-newBlack-1">
          {chapter.startDate && (
            <div className="flex max-md:flex-wrap md:flex-col w-full md:max-w-[282px] gap-4 md:gap-1">
              <div className="flex gap-2 items-center">
                <MdOutlineCalendarMonth size={18} className="shrink-0" />
                <span>{formatDate(chapter.startDate)}</span>
              </div>
              <div className="flex gap-2 items-center">
                <MdAccessTime size={18} className="shrink-0" />
                <span>
                  {formatHourRange(
                    chapter.startDate,
                    chapter.endDate || undefined,
                    chapter.timezone || undefined,
                    true,
                  )}
                </span>
              </div>
            </div>
          )}
          {(chapter.addressLine1 ||
            chapter.addressLine2 ||
            chapter.addressLine3) && (
            <>
              <div className="self-stretch w-px bg-newGray-3 max-md:hidden" />
              <div className="flex gap-2 h-fit items-center">
                <MdOutlineLocationOn size={18} className="shrink-0" />
                <div className="flex flex-col">
                  {[
                    chapter.addressLine1,
                    chapter.addressLine2,
                    chapter.addressLine3,
                  ]
                    .filter(Boolean)
                    .map((line, index) => (
                      <span key={`address-line-${index}-${line}`}>{line}</span>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
        {chapter.isOnline && chapter.isInPerson && (
          <div className="flex flex-col md:flex-row items-center gap-2.5 w-full md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={InformationIcon}
                alt="Information"
                className="w-8 max-md:hidden"
              />
              <p className="w-full max-w-[650px]">
                {t('courses.details.attendInPersonWarning')}
              </p>
            </div>

            {chapter.isInPerson && (
              <div className="flex items-center shrink-0">
                {chapter.remainingSeats !== null &&
                  chapter.remainingSeats > 0 &&
                  !userChapter && (
                    <Button
                      variant="primary"
                      size={isMobile ? 's' : 'm'}
                      onClick={() => {
                        setIsBookModalOpen(true);
                      }}
                    >
                      {t('courses.chapter.detail.bookSeat')}
                    </Button>
                  )}
                {chapter.remainingSeats !== null &&
                  chapter.remainingSeats <= 0 &&
                  !userChapter && (
                    <Button
                      variant="primary"
                      size={isMobile ? 's' : 'm'}
                      disabled={true}
                    >
                      {t('courses.chapter.detail.classIsFull')}
                    </Button>
                  )}
                {userChapter && user && user.username !== null && (
                  <div className="flex flex-row gap-2 max-md:flex-wrap max-md:justify-center">
                    <Button
                      variant="primary"
                      size={isMobile ? 's' : 'm'}
                      onClick={async () => {
                        let pdf = downloadedPdf;
                        if (!pdf) {
                          pdf = await downloadTicketMutateAsync({
                            organizer: course.projectName ?? 'Plan ₿ Network',
                            ...chapter,
                            ...course,
                            formattedStartDate,
                            formattedTime,
                            availableSeats: chapter.availableSeats,
                            userName: user.username,
                          });
                          setDownloadedPdf(pdf);
                        }
                        const fileName = 'ticket.pdf';
                        const blob = base64ToBlob(pdf, 'application/pdf');
                        const url = window.URL.createObjectURL(blob);

                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', fileName);

                        document.body.appendChild(link);

                        link.click();

                        link.parentNode?.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      }}
                    >
                      {t('courses.chapter.detail.ticketDownload')}
                      {isPending ? (
                        <span className="ml-1">
                          <FiLoader />
                        </span>
                      ) : (
                        <span className="ml-1">
                          <FiDownload />
                        </span>
                      )}
                    </Button>
                    <CancelBookingDialog
                      onConfirm={async () => {
                        await cancelBooking();
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </article>

      <CourseBookModal
        course={course}
        chapter={chapter}
        professorNames={professor}
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          refetchUserChapter();
        }}
      />
    </section>
  );
};

const CancelBookingDialog = ({ onConfirm }: { onConfirm: () => void }) => {
  const isMobile = useSmaller('md');
  const { t } = useTranslation();

  return (
    <BasicModal
      trigger={
        <Button variant="outline" size={isMobile ? 's' : 'm'}>
          {t('courses.chapter.detail.cancelBooking')}
        </Button>
      }
      title={t('dashboard.booking.cancelBookingTitle')}
      showLogo={true}
    >
      <div className="!flex gap-4 md:!gap-[30px]">
        <DialogClose asChild>
          <Button
            variant="primary"
            size={isMobile ? 's' : 'l'}
            className="!w-fit"
            onClick={onConfirm}
          >
            {t('dashboard.booking.yesCancel')}
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="outline"
            size={isMobile ? 's' : 'l'}
            className="w-fit"
          >
            {t('dashboard.booking.noGoBack')}
          </Button>
        </DialogClose>
      </div>
    </BasicModal>
  );
};
