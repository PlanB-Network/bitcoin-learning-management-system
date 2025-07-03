import type { JoinedGlossaryWord } from '@blms/types';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import React, { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { cdnUrl } from '#src/utils/index.js';
import { trpc } from '#src/utils/trpc.js';
import { AlphabetGlossary } from '../-components/alphabet-glossary.tsx';
import { GlossaryFilterBar } from '../-components/glossary-filter-bar.tsx';
import { GlossaryList } from '../-components/glossary-list.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';

const GlossaryMarkdownBody = React.lazy(
  () => import('#src/components/Markdown/glossary-markdown-body.js'),
);

export const Route = createFileRoute(
  '/$lang/_content/resources/glossary/$wordId',
)({
  component: GlossaryWord,
  params: {
    parse: (params) => ({
      lang: z.string().parse(params.lang),
      wordId: z.string().parse(params.wordId),
    }),
    stringify: ({ lang, wordId }) => ({
      lang: lang,
      wordId: `${wordId}`,
    }),
  },
});

function GlossaryWord() {
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const [relatedWords, setRelatedWords] = useState<JoinedGlossaryWord[]>([]);

  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: glossaryWord, isFetched } = useQuery(
    trpc.content.getGlossaryWord.queryOptions({
      language: i18n.language ?? 'en',
      strId: params.wordId,
    }),
  );

  const { data: glossaryWords } = useQuery(
    trpc.content.getGlossaryWords.queryOptions({
      language: i18n.language ?? 'en',
    }),
  );

  const { data: proofreading } = useQuery(
    trpc.content.getProofreading.queryOptions(
      {
        language: i18n.language,
        resourceId: glossaryWord?.id,
      },
      {
        enabled: isFetched,
      },
    ),
  );

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
          glossaryWords.filter((word) =>
            glossaryWord.relatedWords?.includes(word.originalWord),
          ),
        );
      }

      document.body.scrollTo({ behavior: 'smooth', top: 0 });
    }
  }, [glossaryWord, glossaryWords, isFetched]);
  const isOriginalLanguage =
    glossaryWord?.language === glossaryWord?.originalLanguage;
  return (
    <ResourceLayout
      link={'/resources/glossary'}
      activeCategory="glossary"
      showPageHeader={false}
      backToCategoryButton
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && (
        <>
          {proofreading ? (
            <ProofreadingProgress
              isOriginalLanguage={isOriginalLanguage}
              mode="dark"
              proofreadingData={{
                contributors: proofreading.contributorNames,
                reward: proofreading.reward,
              }}
            />
          ) : (
            <></>
          )}
          <div className="flex flex-col items-center justify-center w-full max-w-[721px] mx-auto px-4">
            <h2 className="w-full mobile-h2 md:desktop-h4 uppercase text-darkOrange-5 mb-5">
              {glossaryWord?.term}
            </h2>
            <Suspense fallback={<Loader size={'s'} />}>
              <GlossaryMarkdownBody
                content={glossaryWord?.definition || ''}
                assetPrefix={cdnUrl(glossaryWord?.path || '')}
              />
            </Suspense>

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
