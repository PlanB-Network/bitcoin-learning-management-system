import { t } from 'i18next';
import { useCallback, useEffect, useState } from 'react';

import { Modal } from '../../../../atoms/Modal';
import { trpc } from '../../../../utils';
import { Course } from '../../components/courseTree';

interface CoursePaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

type PaymentData = {
  id: string;
  pr: string;
  onChainAddr: string;
  amount: number;
  checkoutUrl: string;
};

export const CoursePaymentModal = ({
  course,
  isOpen,
  onClose,
}: CoursePaymentModalProps) => {
  const savePaymentRequest = trpc.user.courses.savePayment.useMutation();

  const [paymentData, setPaymentData] = useState<PaymentData>();

  const initCoursePayment = useCallback(async () => {
    const serverPaymentData = await savePaymentRequest.mutateAsync({
      courseId: course.id,
    });
    setPaymentData(serverPaymentData);
  }, [course.id, savePaymentRequest]);

  useEffect(() => {
    console.log(isOpen);
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
