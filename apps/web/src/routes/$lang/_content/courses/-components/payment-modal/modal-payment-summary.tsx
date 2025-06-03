import { cn } from '@blms/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { CourseResponse } from '@blms/types';
import leftBackgroundImg from '#src/assets/courses/left-background.webp?no-inline';
import { PaymentRow } from '#src/components/payment-row.js';
import { DEFAULT_CURRENCY, getFormattedUnit } from '#src/services/utils.tsx';
import { formatDateRange } from '#src/utils/date.ts';
import { assetUrl } from '#src/utils/index.ts';

const borderClassName = 'border border-gray-400/25 rounded-xl overflow-hidden';

interface ModalPaymentSummaryProps {
  courseName: string;
  professorNames: string;
  course: CourseResponse;
  mobileDisplay: boolean;
  paidPriceDollars: number;
  satsPrice: number;
}

export const ModalPaymentSummary = ({
  courseName,
  professorNames,
  course,
  mobileDisplay,
  paidPriceDollars,
  satsPrice,
}: ModalPaymentSummaryProps) => {
  const { t } = useTranslation();

  const DescriptionWithBreaks = () => {
    const description = course.paidDescription;
    const parts = description?.split('\n').map((part, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
      <React.Fragment key={index}>
        {index > 0 && <br />}
        {part}
      </React.Fragment>
    ));

    return <span className="text-sm text-white max-lg:hidden">{parts}</span>;
  };

  const Separator = () => (
    <div className="w-full h-px bg-newGray-4 lg:bg-white/10" />
  );

  return (
    <div
      className={cn(
        'flex max-w-[350px] xl:max-w-[500px] 2xl:max-w-[700px] justify-center items-center lg:p-6 bg-cover bg-center max-lg:!bg-none',
        mobileDisplay ? 'lg:hidden' : 'max-lg:hidden',
      )}
      style={{ backgroundImage: `url(${leftBackgroundImg})` }}
    >
      {/* <img
        src={leftBackgroundImg}
        alt="left-background"
        className="hidden lg:block absolute inset-y-0 left-0 h-full w-1/2 object-cover overflow-y-visible"
      /> */}
      <div
        className={cn(
          'flex flex-col w-full max-w-[450px] p-2.5 lg:p-[30px] lg:m-[30px] backdrop-blur-md bg-newGray-5 lg:bg-black/75',
          borderClassName,
        )}
      >
        <span className=" text-black lg:text-white font-medium leading-tight mb-2 lg:mb-6">
          {courseName}
        </span>
        {mobileDisplay ? (
          <span className="text-sm">{professorNames}</span>
        ) : null}
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
        <div className="flex flex-col gap-1 lg:gap-2 mt-1 lg:mt-4 md:mb-5 lg:mb-8">
          {!mobileDisplay ? (
            <>
              <PaymentRow
                label={
                  course.mainProfessors?.length > 1
                    ? t('words.professors')
                    : t('words.professor')
                }
                value={professorNames}
              />
              <Separator />
            </>
          ) : null}
          {course.startDate && course.endDate ? (
            <>
              <PaymentRow
                label={t('courses.payment.date')}
                value={`${formatDateRange(course.startDate, course.endDate)}`}
              />
              <Separator />
            </>
          ) : null}

          <PaymentRow
            label={t('courses.payment.duration')}
            value={t('courses.details.mobile.hours', {
              hours: course.hours.toString(),
            })}
          />
          <Separator />
          <PaymentRow
            label={t('courses.payment.courseType')}
            value={t(`courses.format.${course.format}`)}
          />
        </div>
        <DescriptionWithBreaks />

        <span className="flex items-center justify-center gap-1 w-full px-4 py-2 text-darkOrange-5 lg:text-2xl leading-none bg-white lg:bg-white/10 rounded-lg mt-4">
          <span className="font-semibold">
            {getFormattedUnit(paidPriceDollars || 0, DEFAULT_CURRENCY, 0)}
          </span>
          <span>·</span>
          <span>{satsPrice} sats</span>
        </span>
      </div>
    </div>
  );
};
