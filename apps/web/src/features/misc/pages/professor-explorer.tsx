import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { AuthorCard } from '../../..//components/author-card';
import { ProfessorCard } from '../../../components/professor-card';
import { trpc } from '../../../utils/trpc';
import { ResourceLayout } from '../../resources/layout';

export const ProfessorExplorer = () => {
  const { t } = useTranslation();

  const { data: professors } = trpc.content.getProfessors.useQuery();

  console.log(professors);

  return (
    <ResourceLayout
      title={t('professors.pageTitle')}
      tagLine={t('professors.pageSubtitle')}
    >
      <div className="flex flex-col justify-center bg-blue-900">
        <div className="flex flex-wrap justify-evenly gap-4 text-center text-xl text-white">
          {professors?.map((professor) => {
            return (
              <>
                <div className="hidden sm:block">
                  <ProfessorCard professor={professor} />
                </div>
                <div className=" w-[28rem] sm:hidden">
                  <AuthorCard professor={professor} />
                </div>
              </>
            );
          })}
        </div>
      </div>
    </ResourceLayout>
  );
};
