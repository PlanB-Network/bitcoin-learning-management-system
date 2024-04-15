import { Buffer } from 'buffer';

import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';

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
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-6 lg:gap-0">
        <ModalPaymentSummary event={event} />
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
              paidPriceDollars={event.priceDollars}
              satsPrice={satsPrice}
              initPayment={initEventPayment}
              description={t('courses.payment.description')}
              callout={'Blablabla'}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
