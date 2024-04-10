import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { PageLayout } from '#src/components/PageLayout/index.tsx';

import { AuthorCard } from '../../..//components/author-card.tsx';
import { ProfessorCard } from '../../../components/professor-card.tsx';
import { trpc } from '../../../utils/trpc.ts';

export const ProfessorExplorer = () => {
  const { t, i18n } = useTranslation();

  const { data: professors } = trpc.content.getProfessors.useQuery({
    language: i18n.language,
  });

  return (
    <PageLayout
      title={t('professors.pageTitle')}
      description={t('professors.pageSubtitle')}
    >
      <div className="bg-blue-1000 flex w-full flex-col items-center justify-center">
        <div className="flex max-w-[22rem] flex-wrap items-stretch justify-evenly gap-4 text-center text-xl text-white sm:max-w-none">
          {professors?.map((professor) => {
            return (
              <Link
                to={'/professor/$professorId'}
                params={{
                  professorId: professor.id.toString(),
                }}
                key={professor.id}
                className="h-auto w-full sm:w-auto"
              >
                <div className="hidden h-full sm:block">
                  <ProfessorCard professor={professor} className="h-full" />
                </div>
                <div className="w-full sm:hidden">
                  <AuthorCard professor={professor} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};
