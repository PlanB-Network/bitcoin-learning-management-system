import type { CheckoutData, CouponCode, CourseResponse } from '@blms/types';
import {
  Button,
  customToast,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@blms/ui';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import SignInIconLight from '#src/assets/icons/profile_log_in_light.svg';
import { PaymentDescription } from '#src/components/payment-description.js';
import { PaymentQr } from '#src/components/payment-qr.js';
import { trpc } from '#src/utils/trpc.js';
import { ModalPaymentSuccess } from './modal-payment-success.tsx';
import { ModalPaymentSummary } from './modal-payment-summary.tsx';

interface WebSocketMessage {
  status: string;
}

interface CoursePaymentModalProps {
  course: CourseResponse;
  professorNames: string;
  satsPrice: number;
  dollarPrice: number;
  isOpen: boolean;
  coursePaymentFormat: 'online' | 'inperson';
  onClose: () => void;
}

export const CoursePaymentModal = ({
  course,
  professorNames,
  satsPrice,
  dollarPrice,
  isOpen,
  coursePaymentFormat,
  onClose,
}: CoursePaymentModalProps) => {
  const { t } = useTranslation();

  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const savePaymentRequest = useMutation(
    trpc.user.courses.saveCoursePayment.mutationOptions({
      onError() {
        setCheckoutError(t('courses.payment.checkoutError'));
      },
    }),
  );

  const { data: config } = useQuery(trpc.auth.config.queryOptions());

  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>();
  const [method, setMethod] = useState<'sbp' | 'stripe' | null>(null);
  const [validatedCoupon, setValidatedCoupon] = useState<CouponCode | null>(
    null,
  );
  const [dollarPriceReduced, setDollarsPriceReduced] = useState(dollarPrice);
  const [satsPriceReduced, setSatsPriceReduced] = useState(satsPrice);

  let stripePromise = null;
  if (config) {
    stripePromise = loadStripe(config?.stripePublicKey || '');
  }

  const initCoursePayment = useCallback(
    async (method: 'sbp' | 'stripe' | null) => {
      if (method) {
        const serverCheckoutData = await savePaymentRequest.mutateAsync({
          couponCode: validatedCoupon?.code,
          courseId: course.id,
          courseIndex: course.index,
          dollarPrice: dollarPriceReduced,
          format: coursePaymentFormat,
          method: method,
          satsPrice: satsPriceReduced,
        });
        setCheckoutData(serverCheckoutData);
        if (
          serverCheckoutData.id === 'free' &&
          serverCheckoutData.amount === 0
        ) {
          setIsPaymentSuccess(true);
        }
      }

      setMethod(method);
    },
    [
      course.id,
      coursePaymentFormat,
      dollarPriceReduced,
      satsPriceReduced,
      savePaymentRequest,
      validatedCoupon?.code,
    ],
  );

  useEffect(() => {
    setSatsPriceReduced(satsPrice);
  }, [satsPrice]);

  useEffect(() => {
    setDollarsPriceReduced(dollarPrice);
  }, [dollarPrice]);

  useEffect(() => {
    if (checkoutData && isOpen && satsPrice >= 0) {
      const ws = new WebSocket('wss://api.swiss-bitcoin-pay.ch/invoice');

      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ id: checkoutData.id }));
      });

      const handleMessage = (event: MessageEvent) => {
        const message: WebSocketMessage = JSON.parse(
          event.data as string,
        ) as WebSocketMessage;
        if (message.status === 'settled') {
          setIsPaymentSuccess(true);
        }
      };

      ws.addEventListener('message', handleMessage);

      return () => {
        ws.removeEventListener('message', handleMessage);
        ws.close();
      };
    }
  }, [checkoutData, isOpen, satsPrice]);

  function updateCoupon(coupon: CouponCode | null) {
    setValidatedCoupon(coupon);
    if (coupon?.reductionPercentage) {
      setSatsPriceReduced(
        Math.ceil((satsPrice * (100 - coupon.reductionPercentage)) / 100),
      );
      if (dollarPrice) {
        setDollarsPriceReduced(
          Math.ceil((dollarPrice * (100 - coupon.reductionPercentage)) / 100),
        );
      }
    }

    if (!coupon) {
      setSatsPriceReduced(satsPrice);
      setDollarsPriceReduced(dollarPrice);
      setValidatedCoupon(null);
    }
  }

  useEffect(() => {
    if (isPaymentSuccess) {
      customToast(t('courses.details.courseAddedToDashboard'), {
        closeButton: true,
        color: 'primary',
        imgSrc: SignInIconLight,
        mode: 'light',
      });
    }
  }, [isPaymentSuccess]);

  return (
    <div className="p-4">
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          setCheckoutData(undefined);
          onClose();
        }}
      >
        <DialogContent className="max-h-screen w-[90%] max-w-[1640px] h-[90vh] sm:w-[80vw] lg:p-0 sm:h-[85vh] overflow-auto">
          <DialogTitle className="hidden">Payment Modal</DialogTitle>
          <DialogDescription className="hidden">
            Payment Modal
          </DialogDescription>
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] h-full gap-6 lg:gap-0">
            <ModalPaymentSummary
              course={course}
              courseName={course?.name}
              professorNames={professorNames}
              paidPriceDollars={dollarPrice}
              satsPrice={satsPriceReduced}
              mobileDisplay={false}
            />
            <div className="flex flex-col w-full items-center justify-center lg:m-6">
              {checkoutData ? (
                isPaymentSuccess &&
                (satsPriceReduced === 0 || method === 'sbp') ? (
                  <ModalPaymentSuccess
                    checkoutData={checkoutData}
                    onClose={onClose}
                  />
                ) : method === 'sbp' ? (
                  <PaymentQr
                    checkoutData={checkoutData}
                    onBack={() => setCheckoutData(undefined)}
                  />
                ) : (
                  <div className="flex flex-col lg:w-full md:w-72">
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{
                        clientSecret: checkoutData.clientSecret,
                      }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                    <div className="self-center">
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => {
                          setCheckoutData(undefined);
                          onClose();
                        }}
                      >
                        {t('courses.payment.back_course')}
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <PaymentDescription
                  paidPriceDollars={dollarPriceReduced}
                  satsPrice={satsPriceReduced}
                  initPayment={initCoursePayment}
                  itemId={course.id}
                  updateCoupon={updateCoupon}
                  checkoutError={checkoutError}
                  description={
                    course.format === 'hybrid'
                      ? t('courses.payment.hybridDescription')
                      : coursePaymentFormat === 'inperson'
                        ? t('courses.payment.inPersonDescription')
                        : t('courses.payment.onlineDescription')
                  }
                  isGdprCompliance={course.isGdprCompliance}
                  gdprTerms={
                    course.customTcDisclaimer ?? t('events.tcDisclaimer')
                  }
                  callout={
                    course.format === 'hybrid' ? null : coursePaymentFormat ===
                      'inperson' ? (
                      <Trans i18nKey="courses.payment.inPersonCallout">
                        You are about to purchase <strong>in-person</strong>{' '}
                        access to this course.
                      </Trans>
                    ) : (
                      <>
                        <Trans i18nKey="courses.payment.onlineCallout">
                          You are about to purchase <strong>online</strong>{' '}
                          access to this course.
                        </Trans>
                      </>
                    )
                  }
                >
                  <ModalPaymentSummary
                    course={course}
                    courseName={course?.name}
                    professorNames={professorNames}
                    paidPriceDollars={dollarPriceReduced}
                    satsPrice={satsPriceReduced}
                    mobileDisplay={true}
                  />
                </PaymentDescription>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
