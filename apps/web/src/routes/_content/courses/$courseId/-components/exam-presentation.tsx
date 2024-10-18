import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineModeEdit } from 'react-icons/md';

import type { PartialExamQuestion } from '@blms/types';
import { Button, Divider } from '@blms/ui';

import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { ChangeDisplayNameModal } from '#src/routes/dashboard/_dashboard/-components/change-display-name-modal.tsx';
import { goToChapterParameters } from '#src/utils/courses.ts';
import type { TRPCRouterOutput } from '#src/utils/trpc.ts';
import { trpc } from '#src/utils/trpc.ts';

type Chapter = NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;

export const ExamPresentation = ({
  disabled,
  chapter,
  setIsExamStarted,
  setPartialExamQuestions,
}: {
  disabled?: boolean;
  chapter: Chapter;
  setIsExamStarted: (value: boolean) => void;
  setPartialExamQuestions: (value: PartialExamQuestion[]) => void;
}) => {
  const { i18n } = useTranslation();

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

  const authMode = AuthModalState.SignIn;

  const { user } = useContext(AppContext);

  const isLastChapter =
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  const startExamAttempt = trpc.user.courses.startExamAttempt.useMutation();

  async function onStart() {
    await startExamAttempt.mutateAsync({
      courseId: chapter.courseId,
      language: i18n.language || 'en',
    });
  }

  useEffect(() => {
    if (startExamAttempt.isSuccess) {
      setPartialExamQuestions(startExamAttempt.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsExamStarted(true);
    }
  }, [startExamAttempt, setPartialExamQuestions, setIsExamStarted]);

  return (
    <section className="flex flex-col w-full max-w-[816px] gap-7 md:gap-10">
      <div className="flex flex-col text-newBlack-1">
        <h2 className="text-[34px] leading-tight tracking-[0.25px] max-md:hidden">
          {t('courses.exam.finalExam')}
        </h2>
        <Divider
          className="mt-1 md:mt-2.5 mb-7 md:mb-10"
          width="w-full"
          mode="light"
        />

        <p className="text-darkOrange-5 subtitle-med-16px md:title-large-24px">
          {t('courses.exam.congratulations')}
        </p>
        <p className="body-16px text-justify mt-[18px]">
          {t('courses.exam.testKnowledge')}
        </p>
        <span className="body-medium-16px mt-6">
          {t('courses.exam.instructions')}
        </span>
        <ul className="body-16px text-justify flex flex-col list-disc list-outside pl-6">
          <li>{t('courses.exam.timerStart')}</li>
          <li>{t('courses.exam.examDetails')}</li>
          <li>{t('courses.exam.passRate')}</li>
          <li>{t('courses.exam.dontWorry')}</li>
        </ul>
      </div>

      <div className="flex flex-col w-full max-w-[604px] max-md:gap-4">
        <Divider className="mx-0" width="w-full" mode="dark" />
        <p className="subtitle-medium-16px text-newBlack-1 md:mt-4">
          {t('courses.exam.verifyDisplayName')}
        </p>
        <section className="flex flex-col md:mt-5 gap-2">
          <label
            htmlFor="displayName"
            className="flex gap-0.5 text-dashboardSectionText font-medium leading-[120%]"
          >
            {t('dashboard.profile.displayName')}
            <span className="text-red-5">*</span>
          </label>
          <div className="flex max-lg:flex-col lg:items-center gap-4 md:gap-5">
            <span
              id="displayName"
              className="rounded-md bg-commentTextBackground border border-gray-500/10 px-4 py-2 text-newGray-1 text-sm leading-[120%] w-full max-w-[302px] h-8 truncate"
              onClick={disabled ? openAuthModal : openChangeDisplayNameModal}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  disabled ? openAuthModal() : openChangeDisplayNameModal();
                }
              }}
            >
              {user?.displayName || ''}
            </span>
            <Button
              variant="outline"
              size={window.innerHeight < 768 ? 'xs' : 's'}
              onClick={openChangeDisplayNameModal}
              className="w-fit flex items-center gap-2.5"
            >
              <MdOutlineModeEdit size={18} className="shrink-0" />
              {t('dashboard.profile.change')}
            </Button>
          </div>
        </section>
      </div>

      <div className="flex max-md:flex-col gap-2.5 md:gap-5 w-full">
        <ButtonWithArrow
          className="w-full max-md:max-w-[290px] md:w-fit"
          variant={disabled || !user?.displayName ? 'fakeDisabled' : 'primary'}
          size={window.innerWidth < 768 ? 'm' : 'l'}
          onClick={() =>
            disabled
              ? openAuthModal()
              : user?.displayName
                ? onStart()
                : openChangeDisplayNameModal()
          }
        >
          {t('courses.exam.startExam')}
        </ButtonWithArrow>
        <Link
          className="w-full max-md:max-w-[290px] md:w-fit"
          to={
            isLastChapter
              ? '/courses/$courseId'
              : '/courses/$courseId/$chapterId'
          }
          params={goToChapterParameters(chapter, 'next')}
        >
          <Button
            className="w-full max-md:max-w-[290px] md:w-fit"
            variant="outline"
            size={window.innerWidth < 768 ? 'm' : 'l'}
          >
            <span>
              {window.innerWidth < 768
                ? t('courses.exam.skipExam')
                : t('courses.exam.skipExamGoConclusion')}
            </span>
          </Button>
        </Link>
      </div>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialState={authMode}
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
