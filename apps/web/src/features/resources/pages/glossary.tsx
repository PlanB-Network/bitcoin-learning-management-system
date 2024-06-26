import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AlphabetGlossary } from '../components/AlphabetGlossary/index.tsx';
import { GlossaryList } from '../components/GlossaryList/index.tsx';
import { FilterBar } from '../components/NewFilterBar/index.tsx';
import { ResourceLayout } from '../layout.tsx';

interface GlossaryTerm {
  term: string;
  definition: string;
}

export const Glossary = () => {
  const { t } = useTranslation();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [glossaryTerms] = useState<GlossaryTerm[]>([]);

  const handleLetterSelection = (letter: string) => {
    console.log('Selected letter:', letter);
    setSelectedLetter(letter);
  };

  return (
    <ResourceLayout
      title={t('glossary.pageTitle')}
      tagLine={t('glossary.pageSubtitle')}
    >
      <div className="flex items-center flex-col gap-4 sm:gap-8">
        <FilterBar onChange={() => {}} />
        <AlphabetGlossary onLetterSelect={handleLetterSelection} />
        <GlossaryList
          glossaryTerms={glossaryTerms}
          selectedLetter={selectedLetter}
        />
      </div>
    </ResourceLayout>
  );
};
