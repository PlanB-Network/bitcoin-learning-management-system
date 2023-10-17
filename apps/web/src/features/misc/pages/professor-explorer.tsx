import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { ProfessorCard } from '../../../components/professor-card';
import { ResourceLayout } from '../../resources/layout';

export const ProfessorExplorer = () => {
  const { t } = useTranslation();

  return (
    <ResourceLayout
      title={t('professors.pageTitle')}
      tagLine={t('professors.pageSubtitle')}
    >
      <div className="flex flex-col justify-center bg-blue-900">
        <div className="flex flex-wrap justify-evenly text-center text-xl  text-white sm:py-20">
          <ProfessorCard name="toto" />
        </div>
      </div>
    </ResourceLayout>
  );
};
