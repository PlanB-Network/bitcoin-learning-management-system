import type { CourseChapterResponse } from '@blms/types';
import { Divider } from '@blms/ui';
import { t } from 'i18next';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { ChangeDisplayNameModal } from '#src/routes/$lang/dashboard/_dashboard/-components/change-display-name-modal.tsx';
import { trpc } from '#src/utils/trpc.ts';
import { ChangeDisplayName } from '../shared-between-exams/change-display-name.tsx';

export const SingleTrialExamPresentation = ({
  chapter,
  onStartExam,
}: {
  chapter: CourseChapterResponse;

  onStartExam: () => void;
}) => {
  const { i18n } = useTranslation();
  // const navigate = useNavigate();

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

  const startExamAttempt = trpc.user.courses.startExamAttempt.useMutation();

  async function onStart() {
    await startExamAttempt.mutateAsync({
      courseId: chapter.courseId,
      // chapterId: chapter.chapterId,
      language: i18n.language || 'en',
    });
  }

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

        <p className="text-darkOrange-5 subtitle-medium-med-16px md:title-large-24px">
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
