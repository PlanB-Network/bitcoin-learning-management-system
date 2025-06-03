import { capitalize } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import type { CourseChapterResponse, CourseResponse } from '@blms/types';
import { cn } from '@blms/ui';

import { LANGUAGES_MAP } from '@blms/shared';
import leftBackgroundImg from '#src/assets/courses/left-background.webp?no-inline';
import { PaymentRow } from '#src/components/payment-row.js';
import { formatDateRange, formatHourRange } from '#src/utils/date.js';
import { assetUrl } from '#src/utils/index.ts';

const borderClassName = 'border border-gray-400/25 rounded-xl overflow-hidden';

interface ModalBookSummaryProps {
  courseName: string;
  professorNames: string;
  course: CourseResponse;
  chapter: CourseChapterResponse;
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
  const startDate = chapter.startDate;
  const endDate = chapter.endDate;

  return (
    <div
      className={cn(
        'flex justify-center  lg:p-6 bg-cover bg-center max-lg:!bg-none',
        mobileDisplay ? 'lg:hidden' : 'max-lg:hidden',
      )}
      style={{ backgroundImage: `url(${leftBackgroundImg})` }}
    >
      <div
        className={cn(
          'flex flex-col gap-4 w-full max-w-[492px] p-2.5 lg:p-[30px] backdrop-blur-md bg-newGray-5 lg:bg-black/75',
          borderClassName,
        )}
      >
        <div className="flex flex-col gap-2 text-black lg:text-white font-bold lg:font-medium leading-snug lg:leading-tight capitalize">
          <span className="text-2xl">
            {chapter.part.partIndex}.{chapter.chapterIndex}. {chapter.title}
          </span>
          <span>{professorNames}</span>
        </div>
        <div className={cn('rounded-2xl w-full mb-5 lg:mb-8', borderClassName)}>
          <img
            src={assetUrl(
              `courses/${course.index}`,
              'thumbnail.webp',
              course.lastCommit,
            )}
            alt={courseName}
          />
        </div>
        <div className="flex flex-col gap-1 lg:gap-2">
          <PaymentRow
            label={t('courses.payment.date')}
            value={
              startDate && endDate
                ? formatDateRange(startDate, endDate, timezone)
                : 'TBA'
            }
          />
          <Separator />
          <PaymentRow
            label={t('courses.payment.time')}
            value={
              startDate && endDate
                ? formatHourRange(startDate, endDate, timezone, true)
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
                value={`${chapter.addressLine2 ? `${chapter.addressLine2}\n` : ''}${chapter.addressLine3 ? `${chapter.addressLine3}\n` : ''}${chapter.addressLine1 ? chapter.addressLine1.toUpperCase() : ''}`}
              />
              <Separator />
            </>
          )}
          <PaymentRow
            label={t('events.payment.language')}
            value={
              LANGUAGES_MAP[chapter.language.toLowerCase().replaceAll('-', '')]
            }
          />
          <Separator />
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
