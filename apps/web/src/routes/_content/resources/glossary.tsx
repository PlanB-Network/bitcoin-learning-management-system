import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { trpc } from '#src/utils/trpc.js';

import { AlphabetGlossary } from './-components/AlphabetGlossary/index.tsx';
import { GlossaryFilterBar } from './-components/GlossaryFilterBar/index.tsx';
import { GlossaryList } from './-components/GlossaryList/index.tsx';
import { ResourceLayout } from './-other/layout.tsx';

export const Route = createFileRoute('/_content/resources/glossary')({
  component: Glossary,
});

function Glossary() {
  const { t, i18n } = useTranslation();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: glossaryWords, isFetched } =
    trpc.content.getGlossaryWords.useQuery({
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
      {!isFetched && <Spinner className="size-48 md:size-64 mx-auto" />}
      {isFetched && (
        <div className="flex items-center flex-col px-4">
          <GlossaryFilterBar onChange={setSearchTerm} value={searchTerm} />
          <AlphabetGlossary
            onLetterSelect={handleLetterSelection}
            selectedLetter={selectedLetter}
          />
          {glossaryWords && (
            <GlossaryList
              glossaryTerms={glossaryWords}
              selectedLetter={selectedLetter}
              searchTerm={searchTerm}
            />
          )}
        </div>
      )}
    </ResourceLayout>
  );
}
