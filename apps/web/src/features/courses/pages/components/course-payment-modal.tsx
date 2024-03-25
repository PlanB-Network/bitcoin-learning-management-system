import { Buffer } from 'buffer';

import { t } from 'i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useState } from 'react';
import { AiOutlineCopy, AiOutlineWarning } from 'react-icons/ai';

import { Button, cn } from '@sovereign-university/ui';

import { buttonVariants } from '../../../../../../../packages/ui/src/lib/button/variants.ts';
import leftBackgroundImg from '../../../../assets/courses/left-background.png';
import PlanBLogo from '../../../../assets/planb_logo_horizontal_black.svg?react';
import { Modal } from '../../../../atoms/Modal/index.tsx';
import { ReactPlayer } from '../../../../components/ReactPlayer/index.tsx';
import { addSpaceToCourseId } from '../../../../utils/courses.ts';
import { formatDate } from '../../../../utils/date.ts';
import { computeAssetCdnUrl, trpc } from '../../../../utils/index.ts';
import type { TRPCRouterOutput } from '../../../../utils/trpc.ts';

const hexToBase64 = (hexstring: string) => {
  return Buffer.from(hexstring, 'hex').toString('base64');
};

const getFormattedUnit = (amount: number, unit: string, floating = 2) => {
  let prefix = '';
  if (amount > 0 && amount < 0.01) {
    amount = 0.01;
    prefix = `< `;
  }

  if (unit === 'sats') {
    return `${prefix}${amount} sats`;
  }

  return `${prefix}${Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: unit,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: floating,
    maximumFractionDigits: floating,
  }).format(amount)}`;
};

const DEFAULT_CURRENCY = 'EUR';

interface PaymentData {
  id: string;
  pr: string;
  onChainAddr: string;
  amount: number;
  checkoutUrl: string;
}

interface WebSocketMessage {
  settled: boolean;
}

interface CourseDescriptionModalProps {
  course: NonNullable<TRPCRouterOutput['content']['getCourse']>;
  satsPrice: number;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
}

const sideClassName = 'absolute top-0 left-0 h-full w-1/2';

const borderClassName = 'border border-gray-400/25 rounded-xl overflow-hidden';

interface RowTextProps {
  children: string;
  className?: string;
}

const RowText = ({
  children,
  className = '',
}: RowTextProps & { className?: string }) => (
  <span className={`text-sm ${className}`}>{children}</span>
);

interface RowProps {
  label: string;
  value: string;
  isBlack?: boolean;
}

const Row = ({ label, value, isBlack }: RowProps) => (
  <div className="flex h-10 items-center justify-between w-full">
    <RowText className={`${isBlack ? 'text-slate-950' : 'text-white/[.64]'}`}>
      {label}
    </RowText>
    <RowText
      className={`text-end text-wrap max-w-[70%] truncate ${isBlack ? 'text-slate-950' : 'text-white'}`}
    >
      {value}
    </RowText>
  </div>
);

const Separator = () => <div className="w-100 h-px bg-white/10" />;

interface CalloutProps {
  description: string;
}

const Callout = ({ description }: CalloutProps) => {
  return (
    <div
      className={`${borderClassName} flex flex-row items-center w-full rounded-2xl px-4 py-2 cursor-pointer`}
    >
      <AiOutlineWarning className="size-6" />
      <span className="text-sm flex-1 text-center ml-0.5">{description}</span>
    </div>
  );
};

export const CoursePaymentModal = ({
  course,
  satsPrice,
  isOpen,
  onClose,
}: CourseDescriptionModalProps) => {
  const savePaymentRequest = trpc.user.courses.savePayment.useMutation();

  const [paymentData, setPaymentData] = useState<PaymentData>();
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  const courseName = `${addSpaceToCourseId(course.id)} - ${course.name}`;
  const professorNames = course?.professors
    .map((professor) => professor.name)
    .join(', ');

  const initCoursePayment = useCallback(async () => {
    const serverPaymentData = await savePaymentRequest.mutateAsync({
      courseId: course.id,
      amount: satsPrice,
    });

    setPaymentData(serverPaymentData);

    const ws = new WebSocket('wss://api.swiss-bitcoin-pay.ch/invoice/ln');

    ws.addEventListener('open', () => {
      const hash = hexToBase64(serverPaymentData.id);
      ws.send(JSON.stringify({ hash: hash }));
    });

    const handleMessage = (event: MessageEvent) => {
      const message: WebSocketMessage = JSON.parse(
        event.data as string,
      ) as WebSocketMessage;
      if (message.settled) {
        setIsPaymentSuccess(true);
      }
    };

    ws.addEventListener('message', handleMessage);
  }, [course.id, satsPrice, savePaymentRequest]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isLargeModal>
      <div className="flex h-full">
        <div className="flex-1">
          <img
            src={leftBackgroundImg}
            alt="left-background"
            className={`${sideClassName} object-cover`}
          />
          <div className={`${sideClassName} flex items-center justify-center`}>
            <div
              className={`${borderClassName} relative w-3/4 backdrop-blur-md bg-black/75 p-8`}
            >
              <div className="flex flex-col gap-6">
                <span className="text-base text-white font-medium">
                  {courseName}
                </span>
                <div className={`${borderClassName}`}>
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
                  <Row
                    label={
                      course.professors?.length > 1
                        ? t('courses.details.teachers')
                        : t('courses.details.teacher')
                    }
                    value={professorNames}
                  />
                  <Separator />
                  <Row
                    label={t('courses.details.date')}
                    value={t('courses.details.dates_to', {
                      startDate: course.paidStartDate
                        ? new Date(course.paidStartDate).toLocaleDateString()
                        : '',
                      endDate: course.paidEndDate
                        ? new Date(course.paidEndDate).toLocaleDateString()
                        : '',
                    })}
                  />
                  <Separator />
                  <Row
                    label={t('courses.details.numberOfChapters')}
                    value={course.chaptersCount?.toString() || '-'}
                  />
                  <Separator />
                  <Row
                    label={t('courses.details.duration')}
                    value={course.hours.toString()}
                  />
                  <Separator />
                  <Row
                    label={t('courses.details.accessibility')}
                    value={t('courses.details.accessibility_forever')}
                  />
                </div>
                <span className="text-sm text-white">
                  {course.paidDescription}
                </span>
                <a
                  className={cn(
                    buttonVariants({
                      variant: 'translucent',
                      className: 'text-white',
                    }),
                  )}
                  href={computeAssetCdnUrl(
                    course.lastCommit,
                    `courses/${course.id}/assets/curriculum.pdf`,
                  )}
                  target="_blank"
                  download
                  rel="noreferrer"
                >
                  {t('courses.details.downloadCurriculum')}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center pl-12">
          {paymentData ? (
            isPaymentSuccess ? (
              <div className="items-center justify-center w-96 flex flex-col gap-6">
                <PlanBLogo className="h-auto" width={240} />
                <div className="items-center justify-center flex flex-col gap-6">
                  <span className="text-xl font-semibold text-orange">
                    {t('courses.details.payment_successful')}
                  </span>
                  <span className="text-base text-center">
                    {t('courses.details.access_invoice')}
                  </span>
                </div>
                <span className="text-lg font-medium">
                  {t('courses.details.payment_details')}
                </span>
                <>
                  <Row
                    isBlack
                    label={t('courses.details.amount')}
                    value={`${paymentData.amount} sats`}
                  />
                  <Row
                    isBlack
                    label={t('courses.details.date')}
                    value={formatDate(new Date())}
                  />
                  <Row
                    isBlack
                    label={t('courses.details.invoiceId')}
                    value={paymentData.id}
                  />
                </>
                <Button
                  onClick={() => {
                    onClose(true);
                  }}
                  className="text-white bg-orange-400 w-full"
                >
                  {t('courses.details.startCourse')}
                </Button>
                <div className="text-[10px] text-center uppercase md:text-xs">
                  <span>{t('courses.details.terms1')} </span>
                  <a
                    href={'/terms-and-conditions'}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="text-orange-500">
                      {t('courses.details.terms2')}{' '}
                    </span>
                  </a>
                  <span>{t('courses.details.terms3')}</span>
                </div>
              </div>
            ) : (
              <div className="items-center justify-center w-96 flex flex-col gap-6">
                <PlanBLogo className="h-auto" width={240} />
                <QRCodeSVG value={`lightning:${paymentData.pr}`} size={220} />
                <div
                  className={`${borderClassName} flex flex-row px-4 py-3 relative w-full`}
                >
                  <span className="text-base flex-1 truncate">
                    {paymentData.pr}
                  </span>
                  <AiOutlineCopy
                    className="text-blue-1000 h-7 w-auto cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(paymentData.pr);
                    }}
                  />
                </div>
                <div className="text-[10px] text-center uppercase md:text-xs">
                  <span>{t('courses.details.terms4')} </span>
                </div>
              </div>
            )
          ) : (
            <div className="items-center justify-center w-96 flex flex-col gap-6">
              <PlanBLogo className="h-auto" width={240} />
              <Callout description="You are about to purchase this course." />
              <span className="text-sm">
                This purchase will grant you access to online courses on the
                platform as well as in-person classes, provided you reserve your
                seat in your student dashboard. Each class session takes place
                in person on the specified dates and locations before being
                recorded and streamed online on the platform.
              </span>
              <div className="flex flex-row justify-between w-full">
                <span className="text-lg font-medium">
                  {t('courses.details.total')}
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-medium">
                    {getFormattedUnit(
                      course.paidPriceEuros || 0,
                      DEFAULT_CURRENCY,
                      0,
                    )}
                  </span>
                  <span className="text-sm text-gray-400/50">
                    {satsPrice} sats
                  </span>
                </div>
              </div>
              <Button
                className="text-white bg-orange-400 w-full"
                onClick={initCoursePayment}
              >
                {t('courses.proceedToPayment')}
              </Button>
              <div className="text-[10px] text-center uppercase md:text-xs">
                <>
                  <span>{t('courses.details.terms1')} </span>
                  <a
                    href={'/terms-and-conditions'}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="text-orange-500">
                      {t('courses.details.terms2')}{' '}
                    </span>
                  </a>
                  <span>{t('courses.details.terms3')}</span>
                </>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
