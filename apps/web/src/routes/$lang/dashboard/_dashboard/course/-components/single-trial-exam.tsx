import { Alert, AlertDescription, AlertTitle } from '@blms/ui';
import { t } from 'i18next';
import { AlertCircle } from 'lucide-react';

export const SingleTrialExam = ({
  courseId,
}: {
  courseId: string;
}) => {
  return (
    <section className="flex flex-col mt-4 md:mt-10 w-full max-w-[1000px] gap-6">
      <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
        {t('dashboard.course.exams')}
      </h2>
      <Alert variant="transparent">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-black">
          {t('dashboard.course.generalInformation')}
        </AlertTitle>
        <AlertDescription>
          <p className="whitespace-pre-line text-newBlack-4">
            {t('dashboard.course.planbSchoolExamDescription')}
          </p>
        </AlertDescription>
      </Alert>
    </section>
  );
};
