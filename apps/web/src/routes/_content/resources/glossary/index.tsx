import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader } from '@blms/ui';

import { trpc } from '#src/utils/trpc.js';

import { AlphabetGlossary } from '../-components/alphabet-glossary.tsx';
import { GlossaryFilterBar } from '../-components/glossary-filter-bar.tsx';
import { GlossaryList } from '../-components/glossary-list.tsx';
import { ResourceLayout } from '../-other/layout.tsx';

export const Route = createFileRoute('/_content/resources/glossary/')({
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

  const getRandomWord = () => {
    if (glossaryWords && glossaryWords.length > 0) {
      return glossaryWords[Math.floor(Math.random() * glossaryWords.length)]
        .fileName;
    }
    return '';
  };

  const handleLetterSelection = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? null : letter);
  };

  return (
    <ResourceLayout
      title={t('glossary.pageTitle')}
      tagLine={t('glossary.pageSubtitle')}
      activeCategory="glossary"
      maxWidth="1360"
      addCredits
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && (
        <div className="flex items-center flex-col px-4">
          <GlossaryFilterBar
            onChange={setSearchTerm}
            value={searchTerm}
            randomWord={getRandomWord()}
          />
          <AlphabetGlossary
            onLetterSelect={handleLetterSelection}
            selectedLetter={selectedLetter}
          />
          {glossaryWords && glossaryWords.length > 0 && (
            <GlossaryList
              glossaryTerms={glossaryWords}
              selectedLetter={selectedLetter}
              searchTerm={searchTerm}
            />
          )}
          {glossaryWords && glossaryWords.length === 0 && (
            <p className="text-center mt-10 text-white max-w-2xl mobile-body2 md:desktop-body1 whitespace-pre-line">
              {t('glossary.notTranslated')}{' '}
              <a
                className="underline underline-offset-2 hover:text-darkOrange-5"
                href="https://github.com/PlanB-Network/bitcoin-educational-content"
              >
                {t('underConstruction.github')}
              </a>
              .
            </p>
          )}
        </div>
      )}
    </ResourceLayout>
  );
}
