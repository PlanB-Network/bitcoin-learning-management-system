import { Buffer } from 'buffer';

import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

import type { JoinedEvent } from '@sovereign-university/types';

import { PaymentDescription } from '#src/components/payment-description.js';
import { type PaymentData, PaymentQr } from '#src/components/payment-qr.js';

import { Modal } from '../../../atoms/Modal/index.tsx';
import { trpc } from '../../../utils/trpc.ts';

import { ModalPaymentSuccess } from './modal-payment-success.tsx';
import { ModalPaymentSummary } from './modal-payment-summary.tsx';

const hexToBase64 = (hexstring: string) => {
  return Buffer.from(hexstring, 'hex').toString('base64');
};

interface EventPaymentModalProps {
  eventId: string;
  event: JoinedEvent;
  accessType: 'physical' | 'online' | 'replay';
  satsPrice: number;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
}

interface WebSocketMessage {
  settled: boolean;
}

export const EventPaymentModal = ({
  eventId,
  event,
  accessType,
  satsPrice,
  isOpen,
  onClose,
}: EventPaymentModalProps) => {
  const saveEventPaymentRequest =
    trpc.user.events.saveEventPayment.useMutation();

  const [paymentData, setPaymentData] = useState<PaymentData>();
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  useEffect(() => {
    if (paymentData && isOpen) {
      const ws = new WebSocket('wss://api.swiss-bitcoin-pay.ch/invoice/ln');

      ws.addEventListener('open', () => {
        const hash = hexToBase64(paymentData.id);
        ws.send(JSON.stringify({ hash: hash }));
      });

      const handleMessage = (event: MessageEvent) => {
        const message: WebSocketMessage = JSON.parse(
          event.data as string,
        ) as WebSocketMessage;
        if (message.settled) {
          setTimeout(() => {
            setIsPaymentSuccess(true);
            //onClose(true);
          }, 2000);
        }
      };

      ws.addEventListener('message', handleMessage);

      return () => {
        ws.removeEventListener('message', handleMessage);
        ws.close();
      };
    }
  }, [paymentData, isOpen]);

  const initEventPayment = useCallback(async () => {
    const serverPaymentData = await saveEventPaymentRequest.mutateAsync({
      eventId: eventId,
      amount: satsPrice,
    });
    setPaymentData(serverPaymentData);
  }, [saveEventPaymentRequest, eventId, satsPrice]);

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
          event={event}
          accessType={accessType}
          satsPrice={satsPrice}
          mobileDisplay={false}
        />
        <div className="flex flex-col items-center justify-center lg:pl-6">
          {paymentData ? (
            isPaymentSuccess ? (
              <ModalPaymentSuccess
                paymentData={paymentData}
                accessType={accessType}
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
              paidPriceDollars={event.priceDollars}
              event={event}
              accessType={accessType}
              satsPrice={satsPrice}
              initPayment={initEventPayment}
              itemId={event.id}
              description={
                accessType === 'replay'
                  ? ''
                  : t(`events.payment.description_${accessType}`)
              }
              callout={t(`events.payment.callout_${accessType}`)}
            >
              <ModalPaymentSummary
                event={event}
                accessType={accessType}
                satsPrice={satsPrice}
                mobileDisplay={true}
              />
            </PaymentDescription>
          )}
        </div>
      </div>
    </Modal>
  );
};
