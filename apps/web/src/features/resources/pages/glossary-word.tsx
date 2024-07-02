import { useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { GlossaryMarkdownBody } from '#src/components/GlossaryMarkdownBody/index.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';
import { trpc } from '#src/utils/trpc.js';

import { AlphabetGlossary } from '../components/AlphabetGlossary/index.tsx';
import { GlossaryFilterBar } from '../components/GlossaryFilterBar/index.tsx';
import { GlossaryList } from '../components/GlossaryList/index.tsx';
import { ResourceLayout } from '../layout.tsx';

export const GlossaryWord = () => {
  const { t, i18n } = useTranslation();

  const { wordId } = useParams({
    from: '/resources/glossary/$wordId',
  });

  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: glossaryWord, isFetched } =
    trpc.content.getGlossaryWord.useQuery({
      strId: wordId,
      language: i18n.language ?? 'en',
    });

  const { data: glossaryWords } = trpc.content.getGlossaryWords.useQuery({
    language: i18n.language ?? 'en',
  });

  const handleLetterSelection = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? null : letter);
  };

  const getRandomWord = () => {
    if (glossaryWords && glossaryWords.length > 0) {
      const filteredWords = glossaryWords.filter(
        (word) => word.fileName !== glossaryWord?.fileName,
      );
      return filteredWords[Math.floor(Math.random() * filteredWords.length)]
        .fileName;
    }
    return '';
  };

  useEffect(() => {
    if (glossaryWord && isFetched) {
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [glossaryWord, isFetched]);

  return (
    <ResourceLayout
      title={t('glossary.pageTitle')}
      tagLine={t('glossary.pageSubtitle')}
      activeCategory="glossary"
    >
      {!isFetched && <Spinner className="size-48 md:size-64 mx-auto" />}
      {isFetched && (
        <>
          <div className="flex flex-col items-center justify-center w-full max-w-[1080px] mx-auto px-4">
            <h2 className="w-full mobile-h2 md:desktop-h4 uppercase text-darkOrange-5 mb-5">
              {glossaryWord?.term}
            </h2>
            <GlossaryMarkdownBody
              content={glossaryWord?.definition || ''}
              assetPrefix={computeAssetCdnUrl(
                glossaryWord?.lastCommit || '',
                glossaryWord?.path || '',
              )}
            />
            <div className="w-full h-px bg-newBlack-5 my-6 md:mt-20" />
            <GlossaryFilterBar
              onChange={setSearchTerm}
              value={searchTerm}
              isOnWordPage
              randomWord={getRandomWord()}
            />
            <AlphabetGlossary
              onLetterSelect={handleLetterSelection}
              selectedLetter={selectedLetter}
            />
          </div>
          <div className="px-4 mx-auto w-full">
            {glossaryWords && (
              <GlossaryList
                glossaryTerms={glossaryWords.filter(
                  (word) => word.fileName !== glossaryWord?.fileName,
                )}
                selectedLetter={selectedLetter}
                searchTerm={searchTerm}
              />
            )}
          </div>
        </>
      )}
    </ResourceLayout>
  );
};
