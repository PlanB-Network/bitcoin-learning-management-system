import type { GeneralPaymentItem } from '@blms/constants';
import { cn } from '@blms/ui';
import leftBackgroundImg from '#src/assets/courses/left-background.webp?no-inline';
import SummerSchoolThumbnail from '#src/assets/courses/summer-school-thumbnail.png?no-inline';
import { PaymentRow } from '#src/components/payment-row.tsx';
import { DEFAULT_CURRENCY, getFormattedUnit } from '#src/services/utils.tsx';
const borderClassName = 'border border-gray-400/25 rounded-xl overflow-hidden';

interface ModalPaymentSummaryProps {
  item: GeneralPaymentItem;
  mobileDisplay: boolean;
  paidPriceDollars: number;
  satsPrice: number;
}

export const ModalPaymentSummary = ({
  item,
  mobileDisplay,
  paidPriceDollars,
  satsPrice,
}: ModalPaymentSummaryProps) => {
  // const { t } = useTranslation();

  // const DescriptionWithBreaks = () => {
  //   const description = '';

  //   const parts = description?.split('\n').map((part, index) => (
  //     // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
  //     <React.Fragment key={index}>
  //       {index > 0 && <br />}
  //       {part}
  //     </React.Fragment>
  //   ));

  //   return <span className="text-sm text-white max-lg:hidden">{parts}</span>;
  // };

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
          {/* {item.toString()} */}
        </span>
        {/* {mobileDisplay ? (
          <span className="text-sm">{professorNames}</span>
        ) : null} */}
        <div className={cn('rounded-2xl w-full mb-5 lg:mb-8', borderClassName)}>
          <img src={SummerSchoolThumbnail} alt="The event" />
        </div>
        <div className="flex flex-col gap-1 lg:gap-2 mt-1 lg:mt-4 md:mb-5 lg:mb-8">
          <p className="lg:text-white font-bold text-2xl mb-2">
            Lugano Summer School
          </p>
          {/* {!mobileDisplay ? (
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
          ) : null} */}
          {/* {course.startDate && course.endDate ? (
            <>
              <PaymentRow
                label={t('courses.payment.date')}
                value={`${formatDateRange(course.startDate, course.endDate)}`}
              />
              <Separator />
            </>
          ) : null} */}
          <PaymentRow label="Date" value="21 July to 26 July" />
          <Separator />
          <PaymentRow label="Location" value="Lugano, Switzerland" />
          <Separator />
          <PaymentRow label="Language spoken" value="English" />
          <Separator />
          <PaymentRow label="Type of access" value="In-person" />
          <Separator />
          <PaymentRow label="Limitation" value="21 people" />
          <Separator />
        </div>
        {/* <DescriptionWithBreaks /> */}

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
