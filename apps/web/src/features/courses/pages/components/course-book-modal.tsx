import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal } from '#src/atoms/Modal/index.js';
import { addSpaceToCourseId } from '#src/utils/courses.js';
import type { TRPCRouterOutput } from '#src/utils/trpc.js';

import { ModalBookDescription } from './modal-book-description.tsx';
import { ModalBookSuccess } from './modal-book-success.tsx';
import { ModalBookSummary } from './modal-book-summary.tsx';

interface CourseBookModalProps {
  course: NonNullable<TRPCRouterOutput['content']['getCourse']>;
  chapter: NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;
  professorNames: string;
  satsPrice: number;
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
}

export const CourseBookModal = ({
  course,
  chapter,
  professorNames,
  satsPrice,
  isOpen,
  onClose,
}: CourseBookModalProps) => {
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

  const courseName = `${addSpaceToCourseId(course?.id)} - ${course?.name}`;

  return (
    // eslint-disable-next-line react/jsx-no-undef
    <Modal isOpen={isOpen} onClose={onClose} isLargeModal>
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-6 lg:gap-0">
        <ModalBookSummary
          course={course}
          chapter={chapter}
          courseName={courseName}
          professorNames={professorNames}
        />
        <div className="flex flex-col items-center justify-center pl-6">
          {isCourseBooked ? (
            <ModalBookSuccess course={course} onClose={onClose} />
          ) : (
            <ModalBookDescription
              paidPriceDollars={course.paidPriceDollars}
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
