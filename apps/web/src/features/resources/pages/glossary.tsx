import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AlphabetGlossary } from '../components/AlphabetGlossary/index.tsx';
import { GlossaryFilterBar } from '../components/GlossaryFilterBar/index.tsx';
import { GlossaryList } from '../components/GlossaryList/index.tsx';
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
      activeCategory="glossary"
    >
      <div className="flex items-center flex-col">
        <GlossaryFilterBar onChange={() => {}} />
        <AlphabetGlossary
          onLetterSelect={handleLetterSelection}
          selectedLetter={selectedLetter}
        />
        <GlossaryList
          glossaryTerms={glossaryTerms}
          selectedLetter={selectedLetter}
        />
      </div>
    </ResourceLayout>
  );
};
