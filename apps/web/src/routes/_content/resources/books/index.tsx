import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedBook } from '@blms/types';
import { Loader } from '@blms/ui';

import { assetUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { ResourceCard } from '../-components/cards/resource-card.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute('/_content/resources/books/')({
  component: Books,
});

function Books() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: books, isFetched } = trpc.content.getBooks.useQuery(
    {
      language: i18n.language ?? 'en',
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const sortedBooks: JoinedBook[] = books
    ? (books.sort((a, b) => a.title.localeCompare(b.title)) as JoinedBook[]) // Todo remove this as
    : [];

  return (
    <ResourceLayout
      title={t('library.pageTitle')}
      tagLine={t('library.pageSubtitle')}
      filterBar={{
        onChange: setSearchTerm,
      }}
      activeCategory="books"
    >
      <div className="flex flex-wrap md:justify-center gap-4 md:gap-10 mt-6 md:mt-12 mx-auto">
        {!isFetched && <Loader size={'s'} />}
        {sortedBooks
          .filter((book) =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((book) => (
            <Link
              to={`/resources/books/${formatNameForURL(book.title)}-${book.id}`}
              params={{
                bookId: book.id.toString(),
              }}
              key={book.id}
              className="grow"
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
    </ResourceLayout>
  );
}
