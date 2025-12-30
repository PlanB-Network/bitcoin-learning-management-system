import { ExamType } from '@blms/constants';
import type { CourseChapterResponse } from '@blms/types';
import { ButtonWithArrow } from '@blms/ui';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { AppContext } from '#src/providers/context.tsx';
import { ChangeDisplayNameModal } from '#src/routes/$lang/dashboard/_dashboard/-components/change-display-name-modal.tsx';
import { goToChapterParameters } from '#src/utils/courses.ts';
import { trpc } from '#src/utils/trpc.js';
import { ChangeDisplayName } from '../shared-between-exams/change-display-name.tsx';

export const CourseExamPresentation = ({
  chapter,
  onStartExam,
}: {
  chapter: CourseChapterResponse;
  onStartExam: () => void;
}) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const { user } = useContext(AppContext);
  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const {
    open: openChangeDisplayNameModal,
    isOpen: isChangeDisplayNameModalOpen,
    close: onCloseDisplayNameModal,
  } = useDisclosure();

  const startExamAttempt = useMutation(
    trpc.user.courses.startExamAttempt.mutationOptions(),
  );

  const isLastChapter =
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  function navigateToNextChapter() {
    if (!chapter) {
      return;
    }

    if (isLastChapter) {
      navigate({
        params: goToChapterParameters(chapter, 'next'),
        to: '/courses/$courseId',
      });
    } else {
      navigate({
        params: goToChapterParameters(chapter, 'next'),
        to: '/courses/$courseId/$chapterId',
      });
    }
  }

  async function onStart() {
    await startExamAttempt.mutateAsync({
      chapterId: chapter.chapterId,
      courseId: chapter.courseId,
      examType: ExamType.Final,
      language: i18n.language || 'en',
    });
  }

  useEffect(() => {
    if (startExamAttempt.isSuccess) {
      onStartExam();
    }
  }, [startExamAttempt]);

  return (
    <section className="flex flex-col w-full max-w-[816px] gap-7 md:gap-10">
      <div className="flex flex-col text-neutral-1000">
        <p className="text-orange-500 subtitle-medium-med-16px md:title-large-24px">
          {t('courses.exam.congratulations')}
        </p>
        <p className="body-16px text-justify mt-4">
          {t('courses.exam.testKnowledge')}
        </p>
        <span className="body-medium-16px mt-6">
          {t('courses.exam.instructions')}
        </span>
        <ul className="body-16px flex flex-col list-disc list-outside pl-6">
          <li>{t('courses.exam.timerStart', { minutes: 20 })}</li>
          <li>{t('courses.exam.examDetails', { nb: 40 })}</li>
          <li>{t('courses.exam.passRate')}</li>
          <li>{t('courses.exam.dontWorry')}</li>
        </ul>
      </div>

      <ChangeDisplayName />

      <div className="flex max-md:flex-col gap-2.5 md:gap-5 w-full">
        <ButtonWithArrow
          className="w-full max-md:max-w-[290px] md:w-fit"
          variant={
            !isLoggedIn || !user?.displayName ? 'fakeDisabled' : 'primary'
          }
          size={window.innerWidth < 768 ? 'm' : 'l'}
          onClick={() =>
            !isLoggedIn
              ? openAuthModal()
              : user?.displayName
                ? onStart()
                : openChangeDisplayNameModal()
          }
        >
          {t('courses.exam.startExam')}
        </ButtonWithArrow>

        <ButtonWithArrow
          className="w-full max-md:max-w-[290px] md:w-fit"
          variant="outline"
          size={window.innerWidth < 768 ? 'm' : 'l'}
          onClick={navigateToNextChapter}
        >
          <span>
            {window.innerWidth < 768
              ? t('courses.exam.skipExam')
              : t('courses.exam.skipExamGoConclusion')}
          </span>
        </ButtonWithArrow>
      </div>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialState={AuthModalState.SignIn}
        />
      )}

      <ChangeDisplayNameModal
        isOpen={isChangeDisplayNameModalOpen}
        onClose={() => {
          onCloseDisplayNameModal();
        }}
      />
    </section>
  );
};
