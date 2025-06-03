import { ExamType } from '@blms/constants';
import type { CourseChapterResponse } from '@blms/types';
import { Alert, AlertDescription, AlertTitle, Divider, Loader } from '@blms/ui';
import { t } from 'i18next';
import { useContext, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { LuCircleAlert } from 'react-icons/lu';
import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { ChangeDisplayNameModal } from '#src/routes/$lang/dashboard/_dashboard/-components/change-display-name-modal.tsx';
import { formatTimeRange } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';
import { ChangeDisplayName } from '../shared-between-exams/change-display-name.tsx';

export const SingleTrialExamPresentation = ({
  chapter,
  onStartExam,
}: {
  chapter: CourseChapterResponse;

  onStartExam: () => void;
}) => {
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
  const { data: examInfo, isFetched } = trpc.user.courses.getExamInfo.useQuery({
    chapterId: chapter.chapterId,
    language: chapter.language,
  });

  const now = new Date();
  const isExamEnabled =
    chapter.startDate &&
    chapter.endDate &&
    chapter.startDate?.getTime() < now.getTime() &&
    chapter.endDate?.getTime() > now.getTime();

  async function onStart() {
    // TODO CHECK LANGUAGE LATER (only original? )
    await startExamAttempt.mutateAsync({
      courseId: chapter.courseId,
      chapterId: chapter.chapterId,
      language: chapter.course.originalLanguage,
      examType: ExamType.SingleTrial,
    });
  }

  let nbQuestion = examInfo?.nbQuestions ?? 0;

  // TODO remove hardcoded data when quiz questions are in the data repo
  if (chapter.chapterId === '6065ea4e-2675-11f0-b6ab-bb5e1522cb78') {
    nbQuestion = 25;
  } else if (chapter.chapterId === '9a307a50-2675-11f0-a893-57c148082c1f') {
    nbQuestion = 50;
  }

  useEffect(() => {
    if (startExamAttempt.isSuccess) {
      onStartExam();
    }
  }, [startExamAttempt]);

  return (
    <>
      <Alert variant="default">
        <AlertTitle icon={LuCircleAlert}>
          {t('courses.exam.singleAttempt')}
        </AlertTitle>
        <AlertDescription>
          <div>
            <p className="font-semibold">
              <Trans
                i18nKey={'courses.exam.singleAttemptAvailability'}
                values={{
                  date: formatTimeRange(
                    chapter.startDate!,
                    chapter.endDate!,
                    chapter.timezone ?? 'CET',
                  ),
                }}
              />
            </p>
            <p>{t('courses.exam.singleAttemptPrecaution')}</p>
          </div>
        </AlertDescription>
      </Alert>

      <section className="flex flex-col w-full max-w-[816px] gap-7 md:gap-10">
        <div className="flex flex-col text-newBlack-1">
          <h2 className="text-[34px] leading-tight tracking-[0.25px] max-md:hidden">
            {chapter.title}
          </h2>
          <Divider
            className="mt-1 md:mt-2.5 mb-7 md:mb-10"
            width="w-full"
            mode="light"
          />

          <p className="text-darkOrange-5 subtitle-medium-med-16px md:title-large-24px">
            {t('courses.exam.readyToTest')}
          </p>
          <span className="body-medium-16px mt-6">
            {t('courses.exam.instructions')}
          </span>
          {isFetched ? (
            <ul className="body-16px flex flex-col list-disc list-outside pl-6">
              <li>
                {t('courses.exam.timerStart', {
                  minutes: nbQuestion / 2,
                })}
              </li>
              <li>
                {t('courses.exam.examDetails', {
                  nb: nbQuestion,
                })}
              </li>
              <li>{t('courses.exam.examAvailabilityDetails')}</li>
            </ul>
          ) : (
            <Loader />
          )}
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
            disabled={!isExamEnabled}
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
    </>
  );
};
