import { createFileRoute, useParams } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Card } from '@blms/ui';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.js';
import { trpc } from '#src/utils/trpc.js';

import { BookSummary } from '../-components/book-summary.js';
import { ResourceLayout } from '../-other/layout.js';

export const Route = createFileRoute('/_content/resources/books/$bookId')({
  component: Book,
});

function Book() {
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const { bookId } = useParams({
    from: '/resources/books/$bookId',
  });
  const isScreenMd = useGreater('sm');
  const navigateTo404Called = useRef(false);

  const { data: book, isFetched } = trpc.content.getBook.useQuery({
    id: Number(bookId),
    language: i18n.language ?? 'en',
  });

  const { data: proofreading } = trpc.content.getProofreading.useQuery({
    language: i18n.language,
    resourceId: +bookId,
  });

  useEffect(() => {
    if (!book && isFetched && !navigateTo404Called.current) {
      navigateTo404();
      navigateTo404Called.current = true;
    }
  }, [book, isFetched, navigateTo404]);

  function displayAbstract() {
    return (
      book?.description && (
        <div className="mt-6 border-l-4 border-blue-600 pl-4">
          <h3 className="mb-4 text-lg font-semibold text-blue-900">
            {t('book.abstract')}
          </h3>
          <p className="mb-4 line-clamp-[20] max-w-2xl text-ellipsis whitespace-pre-line pr-4 text-justify text-sm md:pr-8">
            {book?.description}
          </p>
        </div>
      )
    );
  }

  // let buttonSize: 'xs' | 's' = 'xs';
  // if (isScreenMd) {
  //   buttonSize = 's';
  // }

  return (
    <ResourceLayout
      title={t('book.pageTitle')}
      tagLine={t('book.pageSubtitle')}
      link={'/resources/books'}
      activeCategory="books"
      showPageHeader={false}
      backToCategoryButton
    >
      {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
      {book && (
        <div className="w-full">
          {proofreading ? (
            <ProofreadingProgress
              mode="dark"
              proofreadingData={{
                contributors: proofreading.contributorsId,
                reward: proofreading.reward,
              }}
            />
          ) : (
            <></>
          )}
          <Card className="mx-2 md:mx-auto">
            <div className="my-4 w-full grid-cols-1 grid-rows-1 sm:grid-cols-3 md:grid">
              <div className="flex flex-col items-center justify-center border-b-4 border-blue-800 md:mr-10 md:border-0">
                <img
                  className="max-h-72 sm:max-h-96"
                  alt={t('imagesAlt.bookCover')}
                  src={book?.cover}
                />
              </div>

              <div className="col-span-2 my-4 flex flex-col md:mt-0">
                <div>
                  <h2 className="mb-2 max-w-lg text-2xl font-bold text-blue-800 sm:text-4xl">
                    {book?.title}
                  </h2>

                  <div className="mt-2 text-sm">
                    <h5 className="font-light italic">
                      {book?.author}, {book?.publicationYear}.
                    </h5>
                  </div>
                </div>

                <div className="mt-2 text-blue-700">
                  <span className="text-xs font-light italic">
                    {t('book.topicsAddressed')}
                  </span>
                  {book?.tags.map((object, i) => (
                    <span key={i}>
                      {i > 0 && ', '}
                      {object.toUpperCase()}
                    </span>
                  ))}
                </div>
                {isScreenMd && displayAbstract()}
              </div>
            </div>
            {!isScreenMd && displayAbstract()}
          </Card>

          <div className="mx-auto my-6 flex flex-row justify-between p-2">
            <div className="flex flex-col">
              {!book?.summaryText && (
                <BookSummary
                  content={book?.summaryText as string}
                  title={book?.title ? book?.title : ''}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </ResourceLayout>
  );
}
