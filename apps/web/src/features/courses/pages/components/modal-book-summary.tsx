import { capitalize } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import { PaymentRow } from '#src/components/payment-row.js';
import { getDateString, getTimeString } from '#src/utils/date.js';
import type { TRPCRouterOutput } from '#src/utils/trpc.js';

import leftBackgroundImg from '../../../../assets/courses/left-background.webp';
import { ReactPlayer } from '../../../../components/ReactPlayer/index.tsx';

const borderClassName = 'border border-gray-400/25 rounded-xl overflow-hidden';

interface ModalBookSummaryProps {
  courseName: string;
  professorNames: string;
  course: NonNullable<TRPCRouterOutput['content']['getCourse']>;
  chapter: NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;
  mobileDisplay: boolean;
}

export const ModalBookSummary = ({
  courseName,
  professorNames,
  course,
  chapter,
  mobileDisplay,
}: ModalBookSummaryProps) => {
  const { t } = useTranslation();

  const Separator = () => (
    <div className="w-full h-px bg-newGray-4 lg:bg-white/10" />
  );

  const timezone = chapter.timezone || undefined;
  const startDate = chapter.startDate && new Date(chapter.startDate);
  const endDate = chapter.endDate && new Date(chapter.endDate);

  return (
    <div
      className={cn(
        'flex justify-center items-center lg:pr-6',
        mobileDisplay ? 'lg:hidden' : 'max-lg:hidden',
      )}
    >
      <img
        src={leftBackgroundImg}
        alt="left-background"
        className="hidden lg:block absolute top-0 left-0 h-full w-1/2 object-cover overflow-y-visible"
      />
      <div
        className={cn(
          'flex flex-col w-full max-w-[492px] p-2.5 lg:p-[30px] backdrop-blur-md bg-newGray-5 lg:bg-black/75',
          borderClassName,
        )}
      >
        <span className="text-lg lg:text-base text-black lg:text-white font-bold lg:font-medium leading-snug lg:leading-tight capitalize mb-5 lg:mb-6">
          {courseName}
        </span>
        <div
          className={cn(
            'rounded-2xl w-full aspect-video mb-5 lg:mb-8',
            borderClassName,
          )}
        >
          <ReactPlayer
            width="100%"
            height="100%"
            className="m-0"
            controls={true}
            url={course.paidVideoLink as string}
          />
        </div>
        <div className="flex flex-col gap-1 lg:gap-2">
          <PaymentRow
            label={
              course.professors?.length > 1
                ? t('courses.payment.teachers')
                : t('courses.payment.teacher')
            }
            value={professorNames}
          />
          <Separator />
          <PaymentRow
            label={t('courses.payment.date')}
            value={
              startDate && endDate
                ? getDateString(startDate, endDate, timezone)
                : 'TBA'
            }
          />
          <Separator />
          <PaymentRow
            label={t('courses.payment.time')}
            value={
              startDate && endDate
                ? getTimeString(startDate, endDate, timezone)
                : 'TBA'
            }
          />
          <Separator />
          {(chapter.addressLine1 ||
            chapter.addressLine2 ||
            chapter.addressLine3) && (
            <>
              <PaymentRow
                label={t('events.payment.address')}
                value={`${chapter.addressLine2 ? chapter.addressLine2 + '\n' : ''}${chapter.addressLine3 ? chapter.addressLine3 + '\n' : ''}${chapter.addressLine1 ? chapter.addressLine1.toUpperCase() : ''}`}
              />
              <Separator />
            </>
          )}
          <PaymentRow
            label={t('events.payment.limitation')}
            value={
              chapter.availableSeats && chapter.availableSeats > 0
                ? `${t('events.payment.max_capacity')} ${chapter.availableSeats} ${t('events.card.people')}`
                : capitalize(t('events.card.unlimited'))
            }
          />
        </div>
      </div>
    </div>
  );
};
