import * as buffer from 'node:buffer';

import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import { Modal } from '../../../../atoms/Modal';
import { trpc } from '../../../../utils';
import type { TRPCRouterOutput } from '../../../../utils/trpc';

const hexToBase64 = (hexstring: string) => {
  const str = hexstring
    .match(/\w{2}/g)
    ?.map(function (a) {
      return String.fromCharCode(Number.parseInt(a, 16));
    })
    .join('') as string;

  return buffer.Buffer.from(str, 'base64');
};

interface CoursePaymentModalProps {
  course: NonNullable<TRPCRouterOutput['content']['getCourse']>;
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

const getTrue = () => true;

export const CoursePaymentModal = ({
  course,
  satsPrice,
  isOpen,
  onClose,
}: CoursePaymentModalProps) => {
  const savePaymentRequest = trpc.user.courses.savePayment.useMutation();

  const [paymentData, setPaymentData] = useState<PaymentData>();

  const { sendJsonMessage, lastJsonMessage } = useWebSocket<{
    settled: boolean;
  }>(
    'wss://api.swiss-bitcoin-pay.ch/invoice/ln',
    {
      shouldReconnect: getTrue,
    },
    !!paymentData,
  );

  const initCoursePayment = useCallback(async () => {
    const serverPaymentData = await savePaymentRequest.mutateAsync({
      courseId: course.id,
      amount: satsPrice,
    });
    const hash = hexToBase64(serverPaymentData.id);
    sendJsonMessage({ hash: hash });
    setPaymentData(serverPaymentData);
  }, [course.id, satsPrice, savePaymentRequest, sendJsonMessage]);

  useEffect(() => {
    if (isOpen) {
      initCoursePayment();
    } else {
      setTimeout(() => {
        setPaymentData(undefined);
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    if (lastJsonMessage?.settled) {
      setTimeout(() => {
        onClose(true);
      }, 2000);
    }
  }, [lastJsonMessage, onClose]);

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
