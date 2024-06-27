import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AlphabetGlossary } from '../components/AlphabetGlossary/index.tsx';
import { GlossaryFilterBar } from '../components/GlossaryFilterBar/index.tsx';
import { GlossaryList } from '../components/GlossaryList/index.tsx';
import { ResourceLayout } from '../layout.tsx';

interface GlossaryTerm {
  term: string;
  definition: string;
  id: string;
}

export const Glossary = () => {
  const { t } = useTranslation();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [glossaryTerms] = useState<GlossaryTerm[]>([
    {
      term: 'testnet',
      definition:
        'Temporary very long definition to test if everything works correctly. Temporary very long definition to test if everything works correctly. Temporary very long definition to test if everything works correctly. Temporary very long definition to test if everything works correctly. Temporary very long definition to test if everything works correctly. Temporary very long definition to test if everything works correctly.',
      id: 'testnet',
    },
  ]);

  const handleLetterSelection = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? null : letter);
  };

  return (
    <ResourceLayout
      title={t('glossary.pageTitle')}
      tagLine={t('glossary.pageSubtitle')}
      activeCategory="glossary"
      maxWidth="1360"
    >
      <div className="flex items-center flex-col px-4">
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
