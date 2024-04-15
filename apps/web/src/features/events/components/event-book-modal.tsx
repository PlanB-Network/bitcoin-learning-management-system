import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedEvent } from '@sovereign-university/types';

import { Modal } from '#src/atoms/Modal/index.js';

import { ModalBookDescription } from './modal-book-description.tsx';
import { ModalBookSuccess } from './modal-book-success.tsx';
import { ModalBookSummary } from './modal-book-summary.tsx';

interface EventBookModalProps {
  event: JoinedEvent;
  satsPrice: number;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
}

export const EventBookModal = ({
  event,
  satsPrice,
  isOpen,
  onClose,
}: EventBookModalProps) => {
  const { t } = useTranslation();

  //const savePaymentRequest = trpc.user.courses.savePayment.useMutation();
  // const [paymentData, setPaymentData] = useState<PaymentData>();
  const [isCourseBooked, setIsCourseBooked] = useState(false);

  const displaySuccess = useCallback(() => {
    setIsCourseBooked(true);
    // const serverPaymentData = await savePaymentRequest.mutateAsync({
    //   courseId: course.id,
    //   amount: satsPrice,
    // });
    // setPaymentData(serverPaymentData);
    // const ws = new WebSocket('wss://api.swiss-bitcoin-pay.ch/invoice/ln');
    // ws.addEventListener('open', () => {
    //   const hash = hexToBase64(serverPaymentData.id);
    //   ws.send(JSON.stringify({ hash: hash }));
    // });
    // const handleMessage = (event: MessageEvent) => {
    //   const message: WebSocketMessage = JSON.parse(
    //     event.data as string,
    //   ) as WebSocketMessage;
    //   if (message.settled) {
    //     setIsPaymentSuccess(true);
    //   }
    // };
    // ws.addEventListener('message', handleMessage);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isLargeModal>
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-6 lg:gap-0">
        <ModalBookSummary event={event} />
        <div className="flex flex-col items-center justify-center pl-6">
          {isCourseBooked ? (
            <ModalBookSuccess event={event} onClose={onClose} />
          ) : (
            <ModalBookDescription
              paidPriceDollars={event.priceDollars}
              satsPrice={satsPrice}
              onBooked={() => {
                displaySuccess();
              }}
              description={t('courses.payment.description')}
              callout={t('courses.payment.callout')}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
