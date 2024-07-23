import { Link, createFileRoute, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedGlossaryWord } from '@sovereign-university/types';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { GlossaryMarkdownBody } from '#src/components/GlossaryMarkdownBody/index.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';
import { trpc } from '#src/utils/trpc.js';

import { AlphabetGlossary } from './-components/AlphabetGlossary/index.tsx';
import { GlossaryFilterBar } from './-components/GlossaryFilterBar/index.tsx';
import { GlossaryList } from './-components/GlossaryList/index.tsx';
import { ResourceLayout } from './-other/layout.tsx';

export const Route = createFileRoute('/_content/resources/glossary/$wordId')({
  component: GlossaryWord,
});

function GlossaryWord() {
  const { t, i18n } = useTranslation();

  const { wordId } = useParams({
    from: '/resources/glossary/$wordId',
  });

  const [relatedWords, setRelatedWords] = useState<JoinedGlossaryWord[]>([]);

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
      if (glossaryWords) {
        setRelatedWords(
          glossaryWords.filter(
            (word) =>
              glossaryWord.relatedWords &&
              glossaryWord.relatedWords.includes(word.originalWord),
          ),
        );
      }

      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [glossaryWord, glossaryWords, isFetched]);

  return (
    <ResourceLayout
      title={t('glossary.pageTitle')}
      tagLine={t('glossary.pageSubtitle')}
      activeCategory="glossary"
    >
      {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
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

            {relatedWords.length > 0 && (
              <>
                <p className="text-white md:text-lg font-medium self-start mt-5">
                  {t('glossary.relatedWords')}
                </p>
                <ul className="list-disc list-inside text-white self-start">
                  {relatedWords.map((word) => (
                    <li className="ml-2 md:ml-6 py-2" key={word.fileName}>
                      <Link
                        to="/resources/glossary/$wordId"
                        params={{ wordId: word.fileName }}
                        className="text-darkOrange-5 underline underline-offset-4 capitalize"
                      >
                        {word.term}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
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
}
