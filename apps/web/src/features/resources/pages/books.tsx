import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedBook } from '@sovereign-university/types';

import { trpc } from '../../../utils/index.ts';
import { ResourceCard } from '../components/Cards/resource-card.tsx';
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
      <div className="flex flex-wrap justify-center gap-5 lg:gap-[30px] mt-6 md:mt-12 mx-auto">
        {sortedBooks
          .filter((book) =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((book) => (
            <Link
              to={'/resources/book/$bookId'}
              params={{
                bookId: book.id.toString(),
              }}
              className="w-[288px] md:max-w-64"
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
};
