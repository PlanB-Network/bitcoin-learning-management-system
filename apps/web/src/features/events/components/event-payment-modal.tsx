import { Buffer } from 'buffer';

import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';

import { Modal } from '../../../atoms/Modal/index.tsx';
import { trpc } from '../../../utils/trpc.ts';

const hexToBase64 = (hexstring: string) => {
  return Buffer.from(hexstring, 'hex').toString('base64');
};

interface EventPaymentModalProps {
  eventId: string;
  satsPrice: number;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
}

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

export const EventPaymentModal = ({
  eventId,
  satsPrice,
  isOpen,
  onClose,
}: EventPaymentModalProps) => {
  const saveEventPaymentRequest =
    trpc.user.events.saveEventPayment.useMutation();

  const [paymentData, setPaymentData] = useState<PaymentData>();

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
            onClose(true);
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

  useEffect(() => {
    if (isOpen) {
      initEventPayment();
    } else {
      setTimeout(() => {
        setPaymentData(undefined);
      }, 500);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('courses.details.coursePayment')}
    >
      <div className="flex min-w-[85vw] flex-col items-center lg:min-w-80">
        {paymentData ? (
          <iframe
            allow="clipboard-write"
            src={paymentData.checkoutUrl}
            title="SBP"
            style={{
              width: 460,
              maxWidth: '100%',
              height: 740,
              maxHeight: '100%',
            }}
          />
        ) : (
          'Loading...'
        )}
      </div>
    </Modal>
  );
};
