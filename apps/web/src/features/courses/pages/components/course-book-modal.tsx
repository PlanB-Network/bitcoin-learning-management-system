import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineClose } from 'react-icons/ai';

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
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
}

export const CourseBookModal = ({
  course,
  chapter,
  professorNames,
  isOpen,
  onClose,
}: CourseBookModalProps) => {
  const { t } = useTranslation();

  const saveUserChapterRequest =
    trpc.user.courses.saveUserChapter.useMutation();

  const [isCourseBooked, setIsCourseBooked] = useState(false);

  const saveAndDisplaySuccess = useCallback(() => {
    saveUserChapterRequest.mutateAsync({
      courseId: course.id,
      part: chapter.part.part,
      chapter: chapter.chapter,
      booked: true,
    });
    setIsCourseBooked(true);
  }, [chapter.chapter, chapter.part.part, course.id, saveUserChapterRequest]);

  const courseName = `${addSpaceToCourseId(course?.id)} - ${course?.name}`;

  function closeModal() {
    onClose();
    setTimeout(() => {
      setIsCourseBooked(false);
    }, 300);
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isLargeModal>
      <button
        className="absolute right-4 top-2.5 lg:top-5 lg:right-5"
        aria-roledescription="Close Payment Modal"
        onClick={() => onClose()}
      >
        <AiOutlineClose />
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-6 lg:gap-0">
        <ModalBookSummary
          course={course}
          chapter={chapter}
          courseName={courseName}
          professorNames={professorNames}
          mobileDisplay={false}
        />
        <div className="flex flex-col items-center justify-center lg:m-6">
          {isCourseBooked ? (
            <ModalBookSuccess
              course={course}
              chapter={chapter}
              onClose={closeModal}
            />
          ) : (
            <ModalBookDescription
              onBooked={() => {
                saveAndDisplaySuccess();
              }}
              description={t('courses.payment.book_description')}
              callout={t('events.payment.callout_physical')}
            >
              <ModalBookSummary
                course={course}
                chapter={chapter}
                courseName={courseName}
                professorNames={professorNames}
                mobileDisplay={true}
              />
            </ModalBookDescription>
          )}
        </div>
      </div>
    </Modal>
  );
};
