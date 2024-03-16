import { Buffer } from 'buffer';

import { t } from 'i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  type CSSProperties,
  Children,
  Fragment,
  type PropsWithChildren,
  useCallback,
  useState,
} from 'react';
import { AiOutlineCopy } from 'react-icons/ai';

import leftBackgroundImg from '../../../../assets/courses/left-background.png';
import PlanBLogo from '../../../../assets/planb_logo_horizontal_black.svg?react';
import { Modal } from '../../../../atoms/Modal/index.tsx';
import { ReactPlayer } from '../../../../components/ReactPlayer/index.tsx';
import { addSpaceToCourseId } from '../../../../utils/courses.ts';
import { formatTime } from '../../../../utils/date.ts';
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

const sideStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '50%',
  height: '100%',
};

const borderStyle: CSSProperties = {
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.25)',
  overflow: 'hidden',
};

const baseButtonStyle: CSSProperties = {
  borderRadius: 7,
  color: 'white',
  fontSize: 14,
  height: 42,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
};

interface RowTextProps {
  children: string;
  color?: string;
}

const RowText = ({
  children,
  style,
}: RowTextProps & { style?: CSSProperties }) => (
  <span style={{ fontSize: 14, ...style }}>{children}</span>
);

const RowLabel = ({ children, color }: RowTextProps) => (
  <RowText style={{ color: color || 'rgba(255, 255, 255, 0.64)' }}>
    {children}
  </RowText>
);

const RowValue = ({ children, color }: RowTextProps) => (
  <RowText
    style={{
      color: color || 'rgba(255, 255, 255, 1)',
      textAlign: 'end',
      maxWidth: '70%',
      wordWrap: 'break-word',
    }}
  >
    {children}
  </RowText>
);

const Gap = () => <div style={{ height: 26 }} />;

interface VStackProps {
  children: React.ReactNode[];
  style?: CSSProperties;
}

export const VStack = ({ children, style }: PropsWithChildren<VStackProps>) => {
  const filteredChildren = Children.toArray(children).filter(
    (child) => !!child,
  );
  const childrenCount = filteredChildren.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {filteredChildren.map((child, index) => (
        <Fragment key={index}>
          {child}
          {child && index < childrenCount - 1 && <Gap />}
        </Fragment>
      ))}
    </div>
  );
};

interface RowProps {
  label: string;
  value: string;
  isBlack?: boolean;
}

const Row = ({ label, value, isBlack }: RowProps) => (
  <div
    style={{
      height: 38,
      alignItems: 'center',
      justifyContent: 'space-between',
      display: 'flex',
      width: '100%',
    }}
  >
    <RowLabel color={isBlack ? '#050A14' : undefined}>{label}</RowLabel>
    <RowValue color={isBlack ? '#050A14' : undefined}>{value}</RowValue>
  </div>
);

const Separator = () => (
  <div
    style={{
      width: '100%',
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }}
  />
);

interface OptionProps {
  price: string;
  description: string;
  onSelect: () => void;
  isSelected: boolean;
}

const Option = ({ price, description, onSelect, isSelected }: OptionProps) => {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      style={{
        width: '100%',
        borderRadius: 14,
        padding: 14,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        ...borderStyle,
        borderColor: isSelected ? '#FF5C00' : 'rgba(172, 172, 172, 0.25)',
      }}
      onClick={onSelect}
    >
      <input
        type="radio"
        checked={isSelected}
        style={{
          accentColor: '#FF5C00',
        }}
      />
      <span style={{ fontSize: 14, marginLeft: 12 }}>
        <span style={{ fontWeight: 600 }}>{price}</span> {description}
      </span>
    </div>
  );
};

export const CourseDescriptionModal = ({
  course,
  satsPrice,
  isOpen,
  onClose,
}: CourseDescriptionModalProps) => {
  console.log(course);
  const [paymentOption, setPaymentOption] = useState(-1);
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
      withPhysical: paymentOption === 0,
    });

    setPaymentData(serverPaymentData);
    setPaymentOption(-1);

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
  }, [course.id, paymentOption, satsPrice, savePaymentRequest]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setPaymentOption(-1);
        onClose();
      }}
      isLargeModal
    >
      <div className="flex" style={{ height: '100%' }}>
        <div className="flex-1">
          <img
            src={leftBackgroundImg}
            alt="left-background"
            style={{
              ...sideStyle,
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              ...sideStyle,
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            <div
              style={{
                borderRadius: 14,
                position: 'relative',
                width: '75%',
                backdropFilter: 'blur(12px)',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                padding: 32,
                ...borderStyle,
              }}
            >
              <VStack>
                <span style={{ color: 'white', fontWeight: 500, fontSize: 16 }}>
                  {courseName}
                </span>
                <div
                  style={{
                    ...borderStyle,
                    borderRadius: 7,
                    width: '100%',
                    aspectRatio: '16 / 9',
                  }}
                >
                  <ReactPlayer
                    width="100%"
                    height="100%"
                    style={{ margin: 0 }}
                    className="mx-auto mb-2 max-h-[300px] rounded-lg"
                    controls={true}
                    url={course.paidVideoLink as string}
                  />
                </div>
                <>
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
                </>
                <span style={{ color: 'white', fontSize: 14 }}>
                  {course.paidDescription}
                </span>
                <a
                  href={computeAssetCdnUrl(
                    course.lastCommit,
                    `courses/${course.id}/assets/curriculum.pdf`,
                  )}
                  target="_blank"
                  download
                  rel="noreferrer"
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  }}
                >
                  {t('courses.details.downloadCurriculum')}
                </a>
              </VStack>
            </div>
          </div>
        </div>
        <div
          className="flex-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingLeft: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              width: 390,
            }}
          >
            {paymentData ? (
              isPaymentSuccess ? (
                <VStack
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  <PlanBLogo className="h-auto" width={240} />
                  <>
                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: '#FF5C00',
                      }}
                    >
                      {t('courses.details.payment_successful')}
                    </span>
                    <div style={{ height: 16 }} />
                    <span style={{ fontSize: 16 }}>
                      {t('courses.details.access_invoice')}
                    </span>
                  </>
                  <span style={{ fontSize: 18, fontWeight: 500 }}>
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
                      value={formatTime(new Date())}
                    />
                    <Row
                      isBlack
                      label={t('courses.details.invoiceId')}
                      value={paymentData.id}
                    />
                  </>
                  <button
                    onClick={() => {
                      onClose(true);
                    }}
                    style={{
                      ...baseButtonStyle,
                      backgroundColor: '#FF5C00',
                    }}
                  >
                    {t('courses.details.startCourse')}
                  </button>
                </VStack>
              ) : (
                <VStack
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PlanBLogo className="h-auto" width={240} />
                  <QRCodeSVG value={`lightning:${paymentData.pr}`} size={220} />
                  <div
                    className="relative w-full rounded-md shadow-sm"
                    style={{
                      ...borderStyle,
                      borderRadius: 14,
                      padding: 14,
                      cursor: 'pointer',
                      borderColor: 'rgba(172, 172, 172, 0.25)',
                      display: 'flex',
                    }}
                  >
                    <input disabled value={paymentData.pr} type="text" />
                    <AiOutlineCopy
                      className="text-blue-1000 h-7 w-auto cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(paymentData.pr);
                      }}
                    />
                  </div>
                </VStack>
              )
            ) : (
              <VStack
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlanBLogo className="h-auto" width={240} />
                <>
                  <Option
                    price={getFormattedUnit(
                      course.paidPriceEuros || 0,
                      DEFAULT_CURRENCY,
                      0,
                    )}
                    description={
                      'for physical access to the entire course (travel/accomodation not included)'
                    }
                    isSelected={paymentOption === 0}
                    onSelect={() => {
                      setPaymentOption(0);
                    }}
                  />
                  <div style={{ height: 16 }} />
                  <Option
                    price={getFormattedUnit(
                      course.paidPriceEuros || 0,
                      DEFAULT_CURRENCY,
                      0,
                    )}
                    description={'for online access to the entire course'}
                    isSelected={paymentOption === 1}
                    onSelect={() => {
                      setPaymentOption(1);
                    }}
                  />
                </>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 500,
                      fontSize: 18,
                    }}
                  >
                    {t('courses.details.total')}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 18,
                      }}
                    >
                      {getFormattedUnit(
                        course.paidPriceEuros || 0,
                        DEFAULT_CURRENCY,
                        0,
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        color: '#999999',
                      }}
                    >
                      {satsPrice} sats
                    </span>
                  </div>
                </div>
                <button
                  onClick={initCoursePayment}
                  disabled={paymentOption === -1}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor:
                      paymentOption === -1 ? '#BFBFBF' : '#FF5C00',
                  }}
                >
                  {t('courses.purchase')}
                </button>
              </VStack>
            )}
          </div>
          <div
            className="text-[10px] uppercase md:text-xs"
            style={{ textAlign: 'center' }}
          >
            {!paymentData || isPaymentSuccess ? (
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
            ) : (
              <span>{t('courses.details.terms4')} </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
