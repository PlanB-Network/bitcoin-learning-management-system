import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedCourseWithAll } from '@blms/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@blms/ui';

import { addSpaceToCourseId } from '#src/utils/courses.js';
import { type TRPCRouterOutput, trpc } from '#src/utils/trpc.js';

import { ModalBookDescription } from './modal-book-description.tsx';
import { ModalBookSuccess } from './modal-book-success.tsx';
import { ModalBookSummary } from './modal-book-summary.tsx';

interface CourseBookModalProps {
  course: JoinedCourseWithAll;
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
      chapterId: chapter.chapterId,
      booked: true,
    });
    setIsCourseBooked(true);
  }, [chapter.chapterId, course.id, saveUserChapterRequest]);

  const courseName = `${addSpaceToCourseId(course?.id)} - ${course?.name}`;

  function closeModal() {
    onClose();
    setTimeout(() => {
      setIsCourseBooked(false);
    }, 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal()}>
      <DialogContent className="max-w-4xl p-6 w-[90%] lg:h-[50rem] lg:w-full lg:p-0 overflow-auto lg:overflow-hidden">
        <DialogTitle className="hidden">Booking Modal</DialogTitle>
        <DialogDescription className="hidden">Booking Modal</DialogDescription>
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
      </DialogContent>
    </Dialog>
  );
};
