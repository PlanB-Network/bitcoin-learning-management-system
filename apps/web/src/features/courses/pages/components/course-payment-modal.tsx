import { Buffer } from 'buffer';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineClose } from 'react-icons/ai';

import type { CouponCode } from '@sovereign-university/types';

import type { PaymentData } from '#src/components/payment-qr.js';
import { PaymentQr } from '#src/components/payment-qr.js';
import { addSpaceToCourseId } from '#src/utils/courses.js';
import type { TRPCRouterOutput } from '#src/utils/trpc.js';

import { Modal } from '../../../../atoms/Modal/index.tsx';
import { PaymentDescription } from '../../../../components/payment-description.tsx';
import { trpc } from '../../../../utils/index.ts';

import { ModalPaymentSuccess } from './modal-payment-success.tsx';
import { ModalPaymentSummary } from './modal-payment-summary.tsx';

const hexToBase64 = (hexstring: string) => {
  return Buffer.from(hexstring, 'hex').toString('base64');
};

interface WebSocketMessage {
  settled: boolean;
}

interface CoursePaymentModalProps {
  course: NonNullable<TRPCRouterOutput['content']['getCourse']>;
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

  const [paymentData, setPaymentData] = useState<PaymentData>();
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState<CouponCode | null>(
    null,
  );
  const [coursePriceDollarsReduced, setCoursePriceDollarsReduced] = useState(
    course.paidPriceDollars,
  );
  const [satsPriceReduced, setSatsPriceReduced] = useState(satsPrice);

  const initCoursePayment = useCallback(() => {
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

    if (satsPriceReduced === 0) {
      saveFreePayment();
    } else {
      savePayment();
    }
  }, [
    course.id,
    satsPriceReduced,
    saveFreePaymentRequest,
    savePaymentRequest,
    validatedCoupon?.code,
  ]);

  useEffect(() => {
    if (paymentData && isOpen) {
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
  }, [paymentData, isOpen]);

  function updateCoupon(coupon: CouponCode | null) {
    setValidatedCoupon(coupon);
    if (coupon && coupon.reductionPercentage) {
      setSatsPriceReduced(
        (satsPrice * (100 - coupon.reductionPercentage)) / 100,
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
    <Modal isOpen={isOpen} onClose={onClose} isLargeModal>
      <button
        className="absolute right-4 top-2.5 lg:top-5 lg:right-5"
        aria-roledescription="Close Payment Modal"
        onClick={() => onClose()}
      >
        <AiOutlineClose />
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-6 lg:gap-0">
        <ModalPaymentSummary
          course={course}
          courseName={courseName}
          professorNames={professorNames}
          mobileDisplay={false}
        />
        <div className="flex flex-col items-center justify-center lg:pl-6">
          {paymentData ? (
            isPaymentSuccess ? (
              <ModalPaymentSuccess
                paymentData={paymentData}
                onClose={onClose}
              />
            ) : (
              <PaymentQr
                paymentRequest={paymentData.pr}
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
              />
            </PaymentDescription>
          )}
        </div>
      </div>
    </Modal>
  );
};
