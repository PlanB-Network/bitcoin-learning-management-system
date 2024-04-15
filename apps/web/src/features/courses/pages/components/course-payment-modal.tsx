import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PaymentData } from '#src/components/payment-qr.js';
import { PaymentQr } from '#src/components/payment-qr.js';
import { addSpaceToCourseId } from '#src/utils/courses.js';
import { hexToBase64 } from '#src/utils/misc.js';
import type { TRPCRouterOutput } from '#src/utils/trpc.js';

import { Modal } from '../../../../atoms/Modal/index.tsx';
import { PaymentDescription } from '../../../../components/payment-description.tsx';
import { trpc } from '../../../../utils/index.ts';

import { ModalPaymentSuccess } from './modal-payment-success.tsx';
import { ModalPaymentSummary } from './modal-payment-summary.tsx';

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

  const [paymentData, setPaymentData] = useState<PaymentData>();
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

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

  const courseName = `${addSpaceToCourseId(course?.id)} - ${course?.name}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isLargeModal>
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-6 lg:gap-0">
        <ModalPaymentSummary
          course={course}
          courseName={courseName}
          professorNames={professorNames}
        />
        <div className="flex flex-col items-center justify-center pl-6">
          {paymentData ? (
            isPaymentSuccess ? (
              <ModalPaymentSuccess
                paymentData={paymentData}
                onClose={onClose}
              />
            ) : (
              <PaymentQr paymentRequest={paymentData.pr} />
            )
          ) : (
            <PaymentDescription
              paidPriceDollars={course.paidPriceDollars}
              satsPrice={satsPrice}
              initPayment={initCoursePayment}
              description={t('courses.payment.description')}
              callout={t('courses.payment.callout')}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
