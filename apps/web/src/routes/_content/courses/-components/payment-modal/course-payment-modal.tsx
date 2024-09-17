import { Buffer } from 'buffer';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  CheckoutData,
  CouponCode,
  JoinedCourseWithAll,
} from '@blms/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@blms/ui';

import { PaymentDescription } from '#src/components/payment-description.js';
import { PaymentQr } from '#src/components/payment-qr.js';
import { addSpaceToCourseId } from '#src/utils/courses.js';
import { trpc } from '#src/utils/trpc.js';

import { ModalPaymentSuccess } from './modal-payment-success.tsx';
import { ModalPaymentSummary } from './modal-payment-summary.tsx';

const hexToBase64 = (hexString: string) => {
  return Buffer.from(hexString, 'hex').toString('base64');
};

interface WebSocketMessage {
  settled: boolean;
}

interface CoursePaymentModalProps {
  course: JoinedCourseWithAll;
  professorNames: string;
  satsPrice: number;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
}

export const CoursePaymentModal = ({
  course,
  professorNames,
  satsPrice,
  isOpen,
  onClose,
}: CoursePaymentModalProps) => {
  const { t } = useTranslation();

  const savePaymentRequest = trpc.user.courses.savePayment.useMutation();
  const saveFreePaymentRequest =
    trpc.user.courses.saveFreePayment.useMutation();

  const [paymentData, setPaymentData] = useState<CheckoutData>();
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState<CouponCode | null>(
    null,
  );
  const [coursePriceDollarsReduced, setCoursePriceDollarsReduced] = useState(
    course.paidPriceDollars,
  );
  const [satsPriceReduced, setSatsPriceReduced] = useState(satsPrice);

  const initCoursePayment = useCallback(async () => {
    async function saveFreePayment() {
      const serverPaymentData = await saveFreePaymentRequest.mutateAsync({
        courseId: course.id,
        couponCode: validatedCoupon?.code,
      });
      setPaymentData(serverPaymentData);
      setIsPaymentSuccess(true);
    }

    async function savePayment() {
      const serverPaymentData = await savePaymentRequest.mutateAsync({
        courseId: course.id,
        amount: satsPriceReduced,
        couponCode: validatedCoupon?.code,
      });
      setPaymentData(serverPaymentData);
    }

    await (satsPriceReduced === 0 ? saveFreePayment() : savePayment());
  }, [
    course.id,
    satsPriceReduced,
    saveFreePaymentRequest,
    savePaymentRequest,
    validatedCoupon?.code,
  ]);

  useEffect(() => {
    setSatsPriceReduced(satsPrice);
  }, [satsPrice]);

  useEffect(() => {
    if (paymentData && isOpen && satsPrice >= 0) {
      const ws = new WebSocket('wss://api.swiss-bitcoin-pay.ch/invoice/ln');

      ws.addEventListener('open', () => {
        const hash = hexToBase64(paymentData.id);
        ws.send(JSON.stringify({ hash: hash }));
      });

      const handleMessage = (event: MessageEvent) => {
        console.log('Message received');
        const message: WebSocketMessage = JSON.parse(
          event.data as string,
        ) as WebSocketMessage;
        if (message.settled) {
          setIsPaymentSuccess(true);
        }
      };

      ws.addEventListener('message', handleMessage);
    }
  }, [paymentData, isOpen, satsPrice]);

  function updateCoupon(coupon: CouponCode | null) {
    setValidatedCoupon(coupon);
    if (coupon && coupon.reductionPercentage) {
      setSatsPriceReduced(
        Math.ceil((satsPrice * (100 - coupon.reductionPercentage)) / 100),
      );
      if (course.paidPriceDollars) {
        setCoursePriceDollarsReduced(
          (course.paidPriceDollars * (100 - coupon.reductionPercentage)) / 100,
        );
      }
    }

    if (!coupon) {
      setSatsPriceReduced(satsPrice);
      setCoursePriceDollarsReduced(course.paidPriceDollars);
      setValidatedCoupon(null);
    }
  }

  const courseName = `${addSpaceToCourseId(course?.id)} - ${course?.name}`;

  return (
    <div className="p-4">
      <Dialog
        open={isOpen}
        onOpenChange={(open) => onClose(open ? undefined : false)}
      >
        <DialogContent className="max-h-screen w-[90%] lg:w-full max-w-[1440px] h-[90vh] sm:w-[80vw] lg:p-0 sm:h-[85vh] overflow-auto lg:overflow-hidden">
          <DialogTitle className="hidden">Payment Modal</DialogTitle>
          <DialogDescription className="hidden">
            Payment Modal
          </DialogDescription>
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-6 lg:gap-0">
            <ModalPaymentSummary
              course={course}
              courseName={courseName}
              professorNames={professorNames}
              mobileDisplay={false}
            />
            <div className="flex flex-col items-center justify-center lg:m-6">
              {paymentData ? (
                isPaymentSuccess ? (
                  <ModalPaymentSuccess
                    paymentData={paymentData}
                    onClose={onClose}
                  />
                ) : (
                  <PaymentQr
                    paymentData={paymentData}
                    onBack={() => setPaymentData(undefined)}
                  />
                )
              ) : (
                <PaymentDescription
                  paidPriceDollars={coursePriceDollarsReduced}
                  satsPrice={satsPriceReduced}
                  initPayment={initCoursePayment}
                  description={t('courses.payment.description')}
                  callout={t('courses.payment.callout')}
                  itemId={course.id}
                  updateCoupon={updateCoupon}
                >
                  <ModalPaymentSummary
                    course={course}
                    courseName={courseName}
                    professorNames={professorNames}
                    mobileDisplay={true}
                    paidPriceDollars={coursePriceDollarsReduced}
                    satsPrice={satsPriceReduced}
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
