import { Buffer } from 'buffer';

import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';

import { Modal } from '../../../../atoms/Modal/index.tsx';
import { trpc } from '../../../../utils/index.ts';
import type { TRPCRouterOutput } from '../../../../utils/trpc.ts';

const hexToBase64 = (hexstring: string) => {
  return Buffer.from(hexstring, 'hex').toString('base64');
};

interface CoursePaymentModalProps {
  course: NonNullable<TRPCRouterOutput['content']['getCourse']>;
  satsPrice: number;
  withPhysical: boolean;
  part?: number;
  chapter?: number;
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

export const CoursePaymentModal = ({
  course,
  satsPrice,
  withPhysical,
  part,
  chapter,
  isOpen,
  onClose,
}: CoursePaymentModalProps) => {
  const savePaymentRequest = trpc.user.courses.savePayment.useMutation();

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

  const initCoursePayment = useCallback(async () => {
    const serverPaymentData = await savePaymentRequest.mutateAsync({
      courseId: course.id,
      amount: satsPrice,
      withPhysical: withPhysical,
      part: part,
      chapter: chapter,
    });
    setPaymentData(serverPaymentData);
  }, [savePaymentRequest, course.id, satsPrice, withPhysical, part, chapter]);

  useEffect(() => {
    if (isOpen) {
      initCoursePayment();
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
      <div className="flex min-w-[85vw] flex-col items-center lg:min-w-[20rem]">
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
