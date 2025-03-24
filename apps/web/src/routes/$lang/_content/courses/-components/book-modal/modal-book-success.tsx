import { t } from 'i18next';
import { FiLoader } from 'react-icons/fi';

import type { CourseChapterResponse, CourseResponse } from '@blms/types';
import { Button } from '@blms/ui';

import PlanBLogo from '#src/assets/logo/planb_logo_horizontal_black.svg?react';
import { formatDate, formatTime } from '#src/utils/date.js';
import { trpc } from '#src/utils/trpc.js';

interface ModalBookSuccessProps {
  course: CourseResponse;
  chapter: CourseChapterResponse;
  onClose: (isPaid?: boolean) => void;
}

export const ModalBookSuccess = ({
  course,
  chapter,
  onClose,
}: ModalBookSuccessProps) => {
  const { mutateAsync: downloadChapterAsync, isPending } =
    trpc.user.courses.downloadChapterTicket.useMutation();

  const { data: user } = trpc.user.getDetails.useQuery();

  const timezone = chapter.timezone ? chapter.timezone : undefined;
  const formattedStartDate = chapter.startDate
    ? formatDate(chapter.startDate)
    : '';
  const formattedTime =
    chapter.startDate && chapter.endDate
      ? `${formatTime(chapter.startDate, timezone)} ${t('words.to')} ${formatTime(chapter.endDate, timezone)}`
      : '';

  return (
    <div className="items-center justify-center w-60 lg:w-[450px] flex flex-col gap-6">
      <PlanBLogo className="h-auto" width={240} />
      <div className="items-center justify-center flex flex-col gap-6">
        <div className="flex flex-col text-darkOrange-5 text-sm lg:text-xl font-medium leading-relaxed lg:tracking-015px">
          <span className="text-base text-center">
            {t('events.payment.payment_successful')}
          </span>
        </div>

        <div>
          <div className="flex flex-col gap-4">
            <span className="text-center text-xs lg:text-base">
              {t('events.payment.access_physical_successful')}
            </span>
            <span className="text-center text-xs lg:text-base">
              {t('events.payment.limitedSeats')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        <Button
          variant="outline"
          onClick={() => {
            onClose();
          }}
        >
          {t('courses.payment.back_course')}
        </Button>
        <Button
          variant="primary"
          onClick={async () => {
            const base64 = await downloadChapterAsync({
              ...chapter,
              ...course,
              formattedStartDate,
              formattedTime,
              availableSeats: chapter.availableSeats,
              userName: user?.username as string,
            });
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${base64}`;
            link.download = 'ticket.pdf';
            document.body.append(link);
            link.click();
            link.remove();
          }}
        >
          {t('events.payment.download_ticket')}
          {isPending ? (
            <span className="ml-3">
              <FiLoader />
            </span>
          ) : null}
        </Button>
      </div>
    </div>
  );
};
