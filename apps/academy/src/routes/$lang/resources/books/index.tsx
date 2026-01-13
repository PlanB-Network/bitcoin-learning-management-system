import { ResourceType } from '@blms/constants';
import { formatNameForURL } from '@blms/shared';
import type { JoinedBook } from '@blms/types';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { SearchInput } from '#src/components/search-input.tsx';
import { assetUrl } from '#src/utils/index.ts';
import { trpc } from '#src/utils/trpc.js';
import { AddResourceModal } from '../-components/add-resource-modal.tsx';
import { ResourceCard } from '../-components/cards/resource-card.tsx';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/resources/books/')({
  component: Books,
});

function Books() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: books, isFetched } = useQuery(
    trpc.content.getBooks.queryOptions(
      {
        language: i18n.language ?? 'en',
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  const sortedBooks: JoinedBook[] = books
    ? books.sort((a, b) => a.title.localeCompare(b.title))
    : [];

  return (
    <PageLayout
      title={t('resources.books.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
      actionButtons={[
        {
          text: t('resources.addResource.book'),
          onClick: () => setIsModalOpen(true),
        },
      ]}
    >
      <AddResourceModal
        resourceType={ResourceType.Book}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {!isFetched && <Loader size={'s'} />}
      {isFetched && (
        <>
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="ml-auto max-sm:mt-4 mt-2 mb-4 sm:mb-6"
            fullWidthOnMobile
          />
          <div className="flex flex-wrap gap-0.5 sm:gap-6">
            {sortedBooks
              .filter(
                (book) =>
                  book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  book.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  book.author.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((book) => (
                <Link
                  to={`/resources/books/${formatNameForURL(book.title)}-${book.id}`}
                  params={{
                    bookId: book.id.toString(),
                  }}
                  key={book.id}
                  className="max-sm:w-full"
                >
                  <ResourceCard
                    name={book.title}
                    author={book.author}
                    imageSrc={book.cover && assetUrl(book.path, book.cover)}
                    year={book.publicationYear}
                  />
                </Link>
              ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}
