import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedBook } from '@blms/types';
import { Loader } from '@blms/ui';

import { trpc } from '#src/utils/trpc.js';

import { ResourceCard } from '../-components/Cards/resource-card.tsx';
import { ResourceLayout } from '../-other/layout.tsx';

export const Route = createFileRoute('/_content/resources/books/')({
  component: Books,
});

export function Books() {
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
      <div className="flex flex-wrap justify-center gap-4 md:gap-10 mt-6 md:mt-12 mx-auto">
        {!isFetched && <Loader size={'s'} />}
        {sortedBooks
          .filter((book) =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((book) => (
            <Link
              to={'/resources/books/$bookId'}
              params={{
                bookId: book.id.toString(),
              }}
              key={book.id}
            >
              <ResourceCard
                name={book.title}
                author={book.author}
                imageSrc={book.cover}
                year={book.publicationYear}
              />
            </Link>
          ))}
      </div>
    </ResourceLayout>
  );
}
