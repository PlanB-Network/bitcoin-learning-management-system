import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal } from '#src/atoms/Modal/index.js';
import { addSpaceToCourseId } from '#src/utils/courses.js';
import { type TRPCRouterOutput, trpc } from '#src/utils/trpc.js';

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

  const saveUserChapterRequest =
    trpc.user.courses.saveUserChapter.useMutation();

  const [isCourseBooked, setIsCourseBooked] = useState(false);

  const displaySuccess = useCallback(() => {
    saveUserChapterRequest.mutateAsync({
      courseId: course.id,
      part: chapter.part.part,
      chapter: chapter.chapter,
      booked: true,
    });
    setIsCourseBooked(true);
  }, [chapter.chapter, chapter.part.part, course.id, saveUserChapterRequest]);

  const courseName = `${addSpaceToCourseId(course?.id)} - ${course?.name}`;

  return (
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
