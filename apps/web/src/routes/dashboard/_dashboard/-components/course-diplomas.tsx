import { useNavigate } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.ts';

export const CourseDiplomas = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }
  const { data: examResults, isFetched: isExamResultsFetched } =
    trpc.user.courses.getAllSuccededUserExams.useQuery({
      language: i18n.language ?? 'en',
    });

  return (
    <div className="flex flex-col gap-4 lg:gap-8 mt-10">
      <section className="flex flex-col">
        <h4 className="mobile-h3 md:desktop-h6 mb-4">
          {t('dashboard.credentials.bla')}
        </h4>
        <p className="mobile-body2 md:desktop-body1 text-newBlack-4 whitespace-pre-line">
          {t('dashboard.credentials.bla')}
        </p>

        {examResults &&
          examResults.length > 0 &&
          examResults.map((exam, index) => {
            return (
              <p className="mt-4" key={index}>
                {JSON.stringify(exam)}
              </p>
            );
          })}
      </section>
    </div>
  );
};
