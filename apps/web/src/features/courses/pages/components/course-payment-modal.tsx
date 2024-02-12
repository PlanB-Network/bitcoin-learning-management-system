import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
// import useWebSocket from 'react-use-websocket';

import { Modal } from '../../../../atoms/Modal';
import { trpc } from '../../../../utils';
import { Course } from '../../components/courseTree';

interface CoursePaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
}

type PaymentData = {
  id: string;
  pr: string;
  onChainAddr: string;
  amount: number;
  checkoutUrl: string;
};

// const getTrue = () => true;

export const CoursePaymentModal = ({
  course,
  isOpen,
  onClose,
}: CoursePaymentModalProps) => {
  const savePaymentRequest = trpc.user.courses.savePayment.useMutation();

  const [paymentData, setPaymentData] = useState<PaymentData>();

  // const { sendJsonMessage, lastJsonMessage } = useWebSocket<{
  //   settled: boolean;
  // }>(
  //   'wss://api.swiss-bitcoin-pay.ch/invoice/ln',
  //   {
  //     shouldReconnect: getTrue,
  //   },
  //   !!paymentData,
  // );

  // console.log({ lastJsonMessage });

  const initCoursePayment = useCallback(async () => {
    const serverPaymentData = await savePaymentRequest.mutateAsync({
      courseId: course.id,
    });
    // sendJsonMessage({ hash: serverPaymentData.id });
    setPaymentData(serverPaymentData);
  }, [course.id, savePaymentRequest]);

  useEffect(() => {
    if (isOpen) {
      initCoursePayment();
    } else {
      setTimeout(() => {
        setPaymentData(undefined);
      }, 500);
    }
  }, [isOpen]);

  // useEffect(() => {
  //   if (lastJsonMessage.settled) {
  //     onClose(true);
  //   }
  // }, [lastJsonMessage]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('courses.details.coursePayment')}
    >
      <div className="flex flex-col items-center">
        {!paymentData ? (
          'Loading...'
        ) : (
          <iframe
            allow="clipboard-write"
            src={paymentData.checkoutUrl}
            style={{
              width: 460,
              maxWidth: '100%',
              height: 740,
              maxHeight: '100%',
            }}
          />
        )}
      </div>
    </Modal>
  );
};
