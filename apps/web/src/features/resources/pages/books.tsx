import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedBook } from '@sovereign-university/types';

import { trpc } from '../../../utils/index.ts';
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-8 lg:grid-cols-5">
        {sortedBooks
          .filter((book) =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((book) => (
            <div key={book.id}>
              <Link
                className="group z-10 m-auto mx-2 h-fit w-20 min-w-[100px] delay-100 hover:z-20 hover:delay-0"
                to={'/resources/book/$bookId'}
                params={{
                  bookId: book.id.toString(),
                }}
                key={book.id}
              >
                <div className="z-10 mb-2 h-fit px-2 pt-2 transition duration-500 ease-in-out group-hover:scale-125 group-hover:bg-orange-400">
                  {book.cover && (
                    <img
                      className="mx-auto"
                      src={book.cover}
                      alt={book.title}
                    />
                  )}
                  <div className="absolute inset-x-0 rounded-b-lg px-4 py-2 text-left text-xs font-light text-white transition-colors duration-500 ease-in-out group-hover:bg-orange-400">
                    <ul className="opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100">
                      <li className={'pb-1 text-lg font-bold'}>{book.title}</li>
                      {book.author && (
                        <li className={'pb-1 text-xs italic'}>
                          {t('library.writtenBy', { author: book.author })}
                        </li>
                      )}
                      {book.publicationYear && (
                        <li className={'pb-1 text-xs italic'}>
                          {t('library.publishedIn', {
                            date: book.publicationYear,
                          })}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </ResourceLayout>
  );
};
