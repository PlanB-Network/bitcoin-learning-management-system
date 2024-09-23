import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiLoader } from 'react-icons/fi';

import type { JoinedCourseWithAll } from '@blms/types';
import { Button, Card } from '@blms/ui';

import { AppContext } from '#src/providers/context.js';
import { formatDate, formatTime } from '#src/utils/date.js';
import { isDevelopmentEnvironment } from '#src/utils/misc.js';
import { type TRPCRouterOutput, trpc } from '#src/utils/trpc.js';

import { CourseBookModal } from './book-modal/course-book-modal.tsx';

interface ClassDetailsProps {
  course: JoinedCourseWithAll;
  chapter: NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;
  professor: string;
}

const TextLine = ({ label, text }: { label?: string; text?: string }) => {
  return (
    <div className="flex h-7 items-center">
      <span className="text-sm w-24 md:w-32 text-newBlack-5 whitespace-nowrap">
        {label}
      </span>
      <span className="text-sm whitespace-nowrap">{text}</span>
    </div>
  );
};

export const ClassDetails = ({
  course,
  chapter,
  professor,
}: ClassDetailsProps) => {
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [downloadedPdf, setDownloadedPdf] = useState('');

  const { t } = useTranslation();

  const { mutateAsync, isPending } =
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
      ? `${formatTime(chapter.startDate, timezone)} ${t('words.to')} ${formatTime(chapter.endDate, timezone)}`
      : '';
  const formattedCapacity = chapter.availableSeats
    ? `limited to ${chapter.availableSeats} people`
    : '';

  return (
    <div className="flex flex-col mt-6 px-4 md:px-0">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <p className="font-medium text-sm ml-2">
            {t('courses.chapter.detail.title')}
          </p>
          <Card
            className="h-fit !bg-newGray-5 !shadow-course-card border-none"
            color="gray"
          >
            {chapter.startDate && (
              <TextLine
                label={`${t('words.date')} :`}
                text={formattedStartDate}
              />
            )}
            {chapter.startDate && chapter.endDate && (
              <TextLine label={`${t('words.time')} :`} text={formattedTime} />
            )}
            {chapter.addressLine1 && (
              <TextLine label="Location :" text={chapter.addressLine1} />
            )}
            {chapter.addressLine2 && <TextLine text={chapter.addressLine2} />}
            {chapter.addressLine3 && <TextLine text={chapter.addressLine3} />}
            <TextLine label="Teacher :" text={professor} />
            <TextLine
              label="Capacity :"
              text={`${chapter.availableSeats} students`}
            />
            {isDevelopmentEnvironment() && (
              <TextLine
                label="(Remaining) :"
                text={`${chapter.remainingSeats}`}
              />
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-xl leading-8">
            <p className="font-medium max-md:text-base">
              {t('courses.chapter.detail.p1heading')}
            </p>
            <p className="text-newBlack-5 max-md:text-sm">
              {t('courses.chapter.detail.p1content')}
            </p>
          </div>
          {chapter.isInPerson && (
            <div>
              {chapter.remainingSeats !== null &&
                chapter.remainingSeats > 0 &&
                !userChapter && (
                  <Button
                    variant="primary"
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
                  <Button variant="primary" disabled={true}>
                    {t('courses.chapter.detail.classIsFull')}
                  </Button>
                )}
              {userChapter && user && user.displayName !== null && (
                <div className="flex flex-row gap-2">
                  <Button
                    variant="primary"
                    onClick={async () => {
                      let pdf = downloadedPdf;
                      if (!pdf) {
                        pdf = await mutateAsync({
                          ...chapter,
                          ...course,
                          formattedStartDate,
                          formattedTime,
                          formattedCapacity,
                          userDisplayName: user.displayName as string,
                        });
                        setDownloadedPdf(pdf);
                      }
                      const link = document.createElement('a');
                      link.href = `data:application/pdf;base64,${pdf}`;
                      link.download = 'ticket.pdf';
                      document.body.append(link);
                      link.click();
                      link.remove();
                    }}
                  >
                    {t('courses.chapter.detail.ticketDownload')}
                    {isPending ? (
                      <span className="ml-3">
                        <FiLoader />
                      </span>
                    ) : null}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      cancelBooking();
                    }}
                  >
                    {t('courses.chapter.detail.cancelBooking')}
                  </Button>
                </div>
              )}
            </div>
          )}
          <div className="text-xl leading-8">
            <p className="font-medium max-md:text-base">
              {t('courses.chapter.detail.p2heading')}
            </p>
            <p className="text-newBlack-5 max-md:text-sm">
              {t('courses.chapter.detail.p2content')}
            </p>
          </div>
        </div>
      </div>

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

      <div className="mt-6 bg-newGray-1 h-px mx-2" />
    </div>
  );
};
