import type { JoinedGlossaryWord } from '@blms/types';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import React, { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { SearchInput } from '#src/components/search-input.tsx';
import { cdnUrl } from '#src/utils/index.js';
import { trpc } from '#src/utils/trpc.js';
import { AlphabetGlossary } from '../-components/alphabet-glossary.tsx';
import { GlossaryList } from '../-components/glossary-list.tsx';
import { resourcesTabs } from '../index.tsx';

const GlossaryMarkdownBody = React.lazy(
  () => import('#src/components/Markdown/glossary-markdown-body.js'),
);

export const Route = createFileRoute('/$lang/resources/glossary/$wordId')({
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

  const handleLetterSelection = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? null : letter);
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
  return (
    <PageLayout
      title={isFetched ? glossaryWord?.term : t('resources.glossary.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && (
        <>
          <div className="flex flex-col w-full md:mt-4 mt-2">
            <Suspense fallback={<Loader size={'s'} />}>
              <GlossaryMarkdownBody
                content={glossaryWord?.definition || ''}
                assetPrefix={cdnUrl(glossaryWord?.path || '')}
              />
            </Suspense>

            {relatedWords.length > 0 && (
              <>
                <p className="text-black md:text-lg font-medium self-start mt-5">
                  {t('glossary.relatedWords')}
                </p>
                <ul className="list-disc list-inside text-black self-start">
                  {relatedWords.map((word) => (
                    <li className="ml-2 md:ml-6 py-2" key={word.fileName}>
                      <Link
                        to="/resources/glossary/$wordId"
                        params={{ wordId: word.fileName }}
                        className="text-orange-500 underline underline-offset-4 capitalize"
                      >
                        {word.term}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="w-full h-px bg-neutral-100 my-6 md:mt-12 md:mb-16" />
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              className="ml-auto"
              fullWidthOnMobile
            />
            <AlphabetGlossary
              onLetterSelect={handleLetterSelection}
              selectedLetter={selectedLetter}
            />
          </div>
          <div className="w-full">
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
    </PageLayout>
  );
}
