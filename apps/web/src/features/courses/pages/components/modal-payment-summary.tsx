import { useTranslation } from 'react-i18next';

import { PaymentRow } from '#src/components/payment-row.js';
import type { TRPCRouterOutput } from '#src/utils/trpc.js';

import leftBackgroundImg from '../../../../assets/courses/left-background.png';
import { ReactPlayer } from '../../../../components/ReactPlayer/index.tsx';
import { computeAssetCdnUrl } from '../../../../utils/index.ts';

const borderClassName = 'border border-gray-400/25 rounded-xl overflow-hidden';

interface ModalPaymentSummaryProps {
  courseName: string;
  professorNames: string;
  course: NonNullable<TRPCRouterOutput['content']['getCourse']>;
}

export const ModalPaymentSummary = ({
  courseName,
  professorNames,
  course,
}: ModalPaymentSummaryProps) => {
  const { t } = useTranslation();

  const Separator = () => <div className="w-100 h-px bg-white/10" />;

  return (
    <div className="h-full items-center place-items-center  ">
      <img
        src={leftBackgroundImg}
        alt="left-background"
        className={`hidden lg:block absolute top-0 left-0 h-full w-1/2 object-cover`}
      />
      <div className={`flex items-center justify-center align-middle h-full`}>
        <div
          className={`${borderClassName} relative xl:w-3/4 backdrop-blur-md bg-black/75 p-8`}
        >
          <div className="flex flex-col gap-6">
            <span className="text-base text-white font-medium">
              {courseName}
            </span>
            <div className={`${borderClassName} max-w-[500px]`}>
              <ReactPlayer
                width="100%"
                height="100%"
                style={{ margin: 0 }}
                className="mx-auto mb-2 max-h-[300px] rounded-lg"
                controls={true}
                url={course.paidVideoLink as string}
              />
            </div>
            <div>
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
                value={t('courses.payment.dates_to', {
                  startDate: course.paidStartDate
                    ? new Date(course.paidStartDate).toLocaleDateString()
                    : '',
                  endDate: course.paidEndDate
                    ? new Date(course.paidEndDate).toLocaleDateString()
                    : '',
                })}
              />
              <Separator />
              <PaymentRow
                label={t('courses.payment.numberOfChapters')}
                value={course.chaptersCount?.toString() || '-'}
              />
              <Separator />
              <PaymentRow
                label={t('courses.payment.duration')}
                value={course.hours.toString()}
              />
              <Separator />
              <PaymentRow
                label={t('courses.payment.accessibility')}
                value={t('courses.payment.accessibility_forever')}
              />
            </div>
            <span className="text-sm text-white">{course.paidDescription}</span>
            <a
              className="h-9 px-4 py-2 text-white inline-flex justify-center text-sm font-medium focus-visible:outline-none focus-visible:ring-1"
              href={computeAssetCdnUrl(
                course.lastCommit,
                `courses/${course.id}/assets/curriculum.pdf`,
              )}
              target="_blank"
              download
              rel="noreferrer"
            >
              {t('courses.payment.downloadCurriculum')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
