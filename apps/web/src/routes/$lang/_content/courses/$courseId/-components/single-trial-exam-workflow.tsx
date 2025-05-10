import type { CourseChapterResponse } from '@blms/types';
import { Alert, AlertDescription, AlertTitle } from '@blms/ui';
import { t } from 'i18next';
import { AlertCircle } from 'lucide-react';
import { useContext } from 'react';
import { Trans } from 'react-i18next';
import { AppContext } from '#src/providers/context.tsx';
import { getDateString } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';
import { SingleTrialExamPresentation } from './single-trial-exam-presentation.tsx';

interface SingleTrialExamWorkflowProps {
  chapter: CourseChapterResponse;
}

export const SingleTrialExamWorkflow = ({
  chapter,
}: SingleTrialExamWorkflowProps) => {
  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;

  const { data: previousExamResults, isFetched: isPreviousExamResultsFetched } =
    trpc.user.courses.getLatestExamResults.useQuery(
      {
        courseId: chapter.courseId,
      },
      {
        enabled: isLoggedIn,
      },
    );
  const now = new Date();
  const isExamEnabled =
    chapter.startDate &&
    chapter.endDate &&
    chapter.startDate?.getTime() < now.getTime() &&
    chapter.endDate?.getTime() > now.getTime();

  return (
    <>
      {isExamEnabled ? (
        <>
          {((isPreviousExamResultsFetched && previousExamResults === null) ||
            !isLoggedIn) && <SingleTrialExamPresentation />}
        </>
      ) : (
        <>
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('courses.exam.singleAttempt')}</AlertTitle>
            <AlertDescription>
              <div>
                <p className="font-semibold">
                  <Trans
                    i18nKey={'courses.exam.singleAttemptAvailability'}
                    values={{
                      date: getDateString(
                        chapter.startDate,
                        chapter.endDate,
                        chapter.timezone ?? 'UTC',
                        true,
                      ),
                    }}
                  />
                </p>
                <p>{t('courses.exam.singleAttemptPrecaution')}</p>
              </div>
            </AlertDescription>
          </Alert>
        </>
      )}
    </>
  );
};
