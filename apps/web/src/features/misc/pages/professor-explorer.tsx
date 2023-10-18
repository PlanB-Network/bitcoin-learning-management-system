import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { AuthorCard } from '../../..//components/author-card';
import { ProfessorCard } from '../../../components/professor-card';
import { trpc } from '../../../utils/trpc';
import { ResourceLayout } from '../../resources/layout';

export const ProfessorExplorer = () => {
  const { t, i18n } = useTranslation();

  const { data: professors } = trpc.content.getProfessors.useQuery({
    language: i18n.language,
  });

  return (
    <ResourceLayout
      title={t('professors.pageTitle')}
      tagLine={t('professors.pageSubtitle')}
    >
      <div className="bg-blue-1000 flex flex-col items-center justify-center">
        <div className="flex max-w-[22rem] flex-wrap  justify-evenly gap-4 text-center text-xl text-white sm:max-w-none">
          {professors?.map((professor) => {
            return (
              <Link
                to={'/professor/$professorId'}
                params={{
                  professorId: professor.id.toString(),
                }}
                key={professor.id}
              >
                <div className="hidden sm:block">
                  <ProfessorCard professor={professor} />
                </div>
                <div className="w-[28rem] sm:hidden">
                  <AuthorCard professor={professor} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </ResourceLayout>
  );
};
