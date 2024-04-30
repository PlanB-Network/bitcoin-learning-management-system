import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiLoader } from 'react-icons/fi';

import { Button } from '@sovereign-university/ui';

import { Card } from '#src/atoms/Card/index.js';
import { formatDate, formatTime } from '#src/utils/date.js';
import { isDevelopmentEnvironment } from '#src/utils/misc.js';
import { type TRPCRouterOutput, trpc } from '#src/utils/trpc.js';

import { CourseBookModal } from './course-book-modal.tsx';

interface ClassDetailsProps {
  course: NonNullable<TRPCRouterOutput['content']['getCourse']>;
  chapter: NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;
  professor: string;
}

const TextLine = ({ label, text }: { label?: string; text?: string }) => {
  return (
    <div className="flex h-7 items-center">
      <span className="w-32 text-newBlack-5 whitespace-nowrap">{label}</span>
      <span className="whitespace-nowrap">{text}</span>
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
    (uc) =>
      uc.chapter === chapter.chapter &&
      uc.part === chapter.part.part &&
      uc.booked === true,
  );

  const { data: user } = trpc.user.getDetails.useQuery();

  const saveUserChapterRequest =
    trpc.user.courses.saveUserChapter.useMutation();

  const cancelBooking = useCallback(async () => {
    await saveUserChapterRequest.mutateAsync({
      courseId: course.id,
      part: chapter.part.part,
      chapter: chapter.chapter,
      booked: false,
    });
    refetchUserChapter();
  }, [
    chapter.chapter,
    chapter.part.part,
    course.id,
    refetchUserChapter,
    saveUserChapterRequest,
  ]);

  const timezone = chapter.timezone ? chapter.timezone : undefined;
  const formattedStartDate = chapter.startDate
    ? formatDate(new Date(chapter.startDate))
    : '';
  const formattedTime =
    chapter.startDate && chapter.endDate
      ? `${formatTime(new Date(chapter.startDate), timezone)} ${t('words.to')} ${formatTime(new Date(chapter.endDate), timezone)}`
      : '';
  const formattedCapacity = chapter.availableSeats
    ? `limited to ${chapter.availableSeats} people`
    : '';

  return (
    <div className="flex flex-col mt-6  px-4 md:px-0">
      <p className="font-medium text-sm ml-2">
        {t('courses.chapter.detail.title')}
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        <Card className="md:w-1/2 h-fit">
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

        <div className="flex flex-col gap-4 pt-2">
          <div className="text-xl leading-8">
            <p className="font-medium">
              {t('courses.chapter.detail.p1heading')}
            </p>
            <p className="text-newBlack-5">
              {t('courses.chapter.detail.p1content')}
            </p>
          </div>
          {chapter.isInPerson && (
            <div>
              {chapter.remainingSeats !== null &&
                chapter.remainingSeats > 0 &&
                !userChapter && (
                  <Button
                    variant="newPrimary"
                    onClick={() => {
                      setIsBookModalOpen(true);
                    }}
                  >
                    {t('courses.chapter.detail.bookSeat')}
                  </Button>
                )}
              {chapter.remainingSeats !== null &&
                chapter.remainingSeats > 0 &&
                userChapter &&
                user &&
                user.displayName !== null && (
                  <div className="flex flex-row gap-2">
                    <Button
                      variant="newPrimary"
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
                      iconRight={isPending ? <FiLoader /> : undefined}
                    >
                      {t('courses.chapter.detail.ticketDownload')}
                    </Button>
                    <Button
                      variant="newPrimaryGhost"
                      onClick={() => {
                        cancelBooking();
                      }}
                    >
                      {t('courses.chapter.detail.cancelBooking')}
                    </Button>
                  </div>
                )}
              {chapter.remainingSeats !== null &&
                chapter.remainingSeats <= 0 && (
                  <Button variant="newPrimary" disabled={true}>
                    {t('courses.chapter.detail.classIsFull')}
                  </Button>
                )}
            </div>
          )}
          <div className="text-xl leading-8">
            <p className="font-medium">
              {t('courses.chapter.detail.p2heading')}
            </p>
            <p className="text-newBlack-5">
              {t('courses.chapter.detail.p2content')}
            </p>
          </div>
        </div>
      </div>

      <CourseBookModal
        course={course}
        chapter={chapter}
        isOpen={isBookModalOpen}
        professorNames={professor}
        onClose={() => {
          setIsBookModalOpen(false);
          refetchUserChapter();
        }}
      />

      <hr className="mt-6 text-newGray-2 border-t-2" />
    </div>
  );
};
