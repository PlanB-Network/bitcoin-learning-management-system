import { formatNameForURL } from '@blms/shared';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { assetUrl, trpc } from '#src/utils/index.js';
import { useShuffleSuggestedContent } from '#src/utils/resources-hook.ts';
import { ResourceDetails } from '../-components/resource-details.tsx';

export const Route = createFileRoute(
  '/$lang/_content/resources/books/$bookName-$bookId',
)({
  component: Book,
  params: {
    parse: (params) => {
      const bookNameId = params['bookName-$bookId'];
      const { id, name } = getNameAndIdFromUrl(bookNameId);

      return {
        bookId: z.string().parse(id),
        bookName: z.string().parse(name),
        'bookName-$bookId': `${name}-${id}`,
        lang: z.string().parse(params.lang),
      };
    },
    stringify: ({ lang, bookName, bookId }) => ({
      'bookName-$bookId': `${bookName}-${bookId}`,
      lang: lang,
    }),
  },
});

function Book() {
  const params = Route.useParams();
  const { t, i18n } = useTranslation();

  const { data: book, isFetched } = useQuery(
    trpc.content.getBook.queryOptions({
      id: params.bookId,
      language: i18n.language ?? 'en',
    }),
  );
  const navigate = useNavigate();

  const { data: proofreading } = useQuery(
    trpc.content.getProofreading.queryOptions({
      language: i18n.language,
      resourceId: params.bookId,
    }),
  );

  const { data: suggestedBooks, isFetched: isFetchedSuggestedBooks } = useQuery(
    trpc.content.getBooks.queryOptions({}),
  );

  useEffect(() => {
    if (book && params.bookName !== formatNameForURL(book.title)) {
      navigate({
        replace: true,
        to: `/resources/books/${formatNameForURL(book.title)}-${book.id}`,
      });
    }
  }, [book, isFetched, navigate, params.bookName]);

  const shuffledSuggestedBooks = useShuffleSuggestedContent(
    suggestedBooks ?? [],
    book,
  );

  return (
    <PageLayout
      backLink={{ href: '/resources/books', text: t('resources.books.title') }}
      layoutSize="wide"
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !book && (
        <div>
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.book'),
          })}
        </div>
      )}
      {book && (
        <div className="w-full">
          {proofreading ? (
            <ProofreadingProgress
              isOriginalLanguage={true}
              mode="light"
              proofreadingData={{
                contributors: proofreading.contributorNames,
                reward: proofreading.reward,
              }}
            />
          ) : null}
          <ResourceDetails
            title={book.title}
            subtitle={`${book.author} • ${book.publicationYear}`}
            tags={book.tags}
            imgSrc={book.cover ? assetUrl(book.path, book.cover) : ''}
            abstract={book.description || ''}
            suggestedHeaderText={'resources.pageSubtitleBooks'}
            suggestedResources={
              isFetchedSuggestedBooks
                ? shuffledSuggestedBooks.map((suggestedBook) => {
                    const isBook =
                      'title' in suggestedBook &&
                      'cover' in suggestedBook &&
                      suggestedBook.cover;
                    return {
                      title: isBook ? suggestedBook.title : '',
                      href: isBook
                        ? `/resources/books/${formatNameForURL(suggestedBook.title)}-${suggestedBook.id}`
                        : '',
                      imgSrc: isBook
                        ? assetUrl(suggestedBook.path, suggestedBook.cover)
                        : '',
                    };
                  })
                : undefined
            }
          />
        </div>
      )}
    </PageLayout>
  );
}
