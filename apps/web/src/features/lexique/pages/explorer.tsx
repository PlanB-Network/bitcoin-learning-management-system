import { useTranslation } from 'react-i18next';

import { MainLayout } from '../../../components/MainLayout';
import { useState } from 'react';
import { FilterBar } from '../components/FilterBar';
import { LetterGroupButton } from '../components/LetterGroupButton';
import { PageTitle } from '../components/PageTitle';
import { ItemCard } from '../components/ItemCard';

export const Lexique = () => {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(1);
  const [currentLetter, setCurrentLetter] = useState('A');

  return (
    <MainLayout footerVariant="light">
      <div className="flex flex-col justify-center bg-gray-100">
        <div className="lg:w-11/12 w-10/12 mx-auto mt-12">
          <div className="w-full flex flex-col space-y-8">
            <PageTitle />
            <div className="w-full flex lg:flex-row flex-col lg:space-x-5 items-center">
              <FilterBar
                label={t('lexique.filterBarLabel')}
                onChange={() => {}}
              />
              <LetterGroupButton
                currentLetter={currentLetter}
                setCurrentLetter={setCurrentLetter}
              />
            </div>
            <ItemCard expanded={expanded} setExpanded={setExpanded} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
