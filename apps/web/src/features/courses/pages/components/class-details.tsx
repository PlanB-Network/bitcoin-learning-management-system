import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@sovereign-university/ui';

import { Card } from '#src/atoms/Card/index.js';
import { formatDate, formatTime } from '#src/utils/date.js';
import type { TRPCRouterOutput } from '#src/utils/trpc.js';

import { CourseBookModal } from './course-book-modal.tsx';

interface ClassDetailsProps {
  course: NonNullable<TRPCRouterOutput['content']['getCourse']>;
  chapter: NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;
  professor: string;
}

const TextLine = ({ label, text }: { label?: string; text?: string }) => {
  return (
    <div className="flex h-7 items-center">
      <span className="w-32 text-newBlack-5">{label}</span>
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

  const { t } = useTranslation();
  const timezone = chapter.timezone ? chapter.timezone : undefined;

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
              text={formatDate(chapter.startDate)}
            />
          )}
          {chapter.startDate && chapter.endDate && (
            <TextLine
              label={`${t('words.time')} :`}
              text={`${formatTime(chapter.startDate, timezone)} ${t('words.to')} ${formatTime(chapter.endDate, timezone)}`}
            />
          )}
          {chapter.addressLine1 && (
            <TextLine label="Location :" text={chapter.addressLine1} />
          )}
          {chapter.addressLine2 && <TextLine text={chapter.addressLine2} />}
          {chapter.addressLine3 && <TextLine text={chapter.addressLine3} />}
          <TextLine label="Teacher :" text={professor} />
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
          <div className="text-xl leading-8">
            <p className="font-medium">
              {' '}
              {t('courses.chapter.detail.p2heading')}
            </p>
            <p className="text-newBlack-5">
              {t('courses.chapter.detail.p2content')}
            </p>
          </div>
          {chapter.isInPerson && (
            <div>
              <Button
                variant="newPrimary"
                onClick={() => {
                  setIsBookModalOpen(true);
                }}
              >
                {t('courses.chapter.detail.bookSeat')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <CourseBookModal
        course={course}
        chapter={chapter}
        satsPrice={1_111_111}
        isOpen={isBookModalOpen}
        professorNames={'TEST'}
        onClose={() => {
          setIsBookModalOpen(false);
          // refetchPayment();
        }}
      />

      <hr className="mt-6 text-newGray-2 border-t-2" />
    </div>
  );
};
