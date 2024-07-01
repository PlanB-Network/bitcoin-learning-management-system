import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { trpc } from '#src/utils/trpc.js';

import { AlphabetGlossary } from '../components/AlphabetGlossary/index.tsx';
import { GlossaryFilterBar } from '../components/GlossaryFilterBar/index.tsx';
import { GlossaryList } from '../components/GlossaryList/index.tsx';
import { ResourceLayout } from '../layout.tsx';

export const Glossary = () => {
  const { t, i18n } = useTranslation();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const { data: glossaryWords } = trpc.content.getGlossaryWords.useQuery({
    language: i18n.language ?? 'en',
  });

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
        {glossaryWords && (
          <GlossaryList
            glossaryTerms={glossaryWords}
            selectedLetter={selectedLetter}
          />
        )}
      </div>
    </ResourceLayout>
  );
};
