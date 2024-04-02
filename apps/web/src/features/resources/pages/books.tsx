import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedBook } from '@sovereign-university/types';

import { trpc } from '../../../utils/index.ts';
import { BookCard } from '../components/Cards/book-card.tsx';
import { ResourceLayout } from '../layout.tsx';

export const Books = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: books } = trpc.content.getBooks.useQuery({
    language: i18n.language ?? 'en',
  });

  const sortedBooks: JoinedBook[] = books
    ? (books.sort((a, b) => a.title.localeCompare(b.title)) as JoinedBook[]) // Todo remove this as
    : [];

  return (
    <ResourceLayout
      title={t('library.pageTitle')}
      tagLine={t('library.pageSubtitle')}
      filterBar={{
        onChange: setSearchTerm,
        label: t('resources.filterBarLabel'),
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        {sortedBooks
          .filter((book) =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((book) => (
            <BookCard book={book} key={book.id} />
          ))}
      </div>
    </ResourceLayout>
  );
};
