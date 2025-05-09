import type { CourseChapterResponse } from '@blms/types';
import { Alert, AlertDescription, AlertTitle } from '@blms/ui';
import { t } from 'i18next';
import { AlertCircle } from 'lucide-react';
import { Trans } from 'react-i18next';
import { getDateString } from '#src/utils/date.ts';

interface SingleTrialExamWorkflowProps {
  chapter: CourseChapterResponse;
  disabled?: boolean;
}

export const SingleTrialExamWorkflow = ({
  chapter,
  disabled,
}: SingleTrialExamWorkflowProps) => {
  const now = new Date();
  const isExamOngoing =
    chapter.startDate &&
    chapter.endDate &&
    chapter.startDate?.getTime() < now.getTime() &&
    chapter.endDate?.getTime() > now.getTime();

  return (
    <>
      {isExamOngoing ? null : (
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
