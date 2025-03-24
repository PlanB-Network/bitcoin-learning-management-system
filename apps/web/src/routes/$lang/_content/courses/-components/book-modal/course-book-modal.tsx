import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { CourseChapterResponse, CourseResponse } from '@blms/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@blms/ui';

import { addSpaceToCourseIndex } from '#src/utils/courses.js';
import { trpc } from '#src/utils/trpc.js';

import { ModalBookDescription } from './modal-book-description.tsx';
import { ModalBookSuccess } from './modal-book-success.tsx';
import { ModalBookSummary } from './modal-book-summary.tsx';

interface CourseBookModalProps {
  course: CourseResponse;
  chapter: CourseChapterResponse;
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

  const courseName = `${addSpaceToCourseIndex(course?.index)} - ${course?.name}`;

  function closeModal() {
    onClose();
    setTimeout(() => {
      setIsCourseBooked(false);
    }, 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal()}>
      <DialogContent className="max-w-6xl p-6 w-[90%] lg:h-[50rem] lg:w-full lg:p-0 overflow-auto">
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
                callout={
                  <Trans
                    i18nKey={'events.payment.callout_book_physical'}
                    components={{
                      highlight: <span className="font-medium" />,
                    }}
                  />
                }
                isGdprCompliance={chapter.isGdprCompliance}
                gdprTerms={
                  chapter.customTcDisclaimer ?? t('events.tcDisclaimer')
                }
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
