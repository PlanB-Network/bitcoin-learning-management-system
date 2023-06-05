import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { ResourceLayout } from '../../components';
import { Routes } from '../../types';

export const Library = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetching data from the API
  const { data: books } = trpc.content.getBooks.useQuery();

  // Adding a category to each builder
  const sortedBooks = books
    ? books.sort((a, b) => a.title.localeCompare(b.title))
    : [];

  const categorizedBooks = sortedBooks.reduce((acc, book) => {
    if (!acc[book.title]) {
      acc[book.title] = [];
    }
    acc[book.title].push(book);
    return acc;
  }, {} as Record<string, typeof sortedBooks>);

  const categories = [...new Set(sortedBooks.map((book) => book.title))].sort(
    (a, b) => categorizedBooks[b].length - categorizedBooks[a].length
  );

  return (
    <ResourceLayout
      title={t('books.pageTitle')}
      tagLine={t('books.pageSubtitle')}
      filterBar={{
        onChange: () => setSearchTerm,
        label: t('resources.filterBarLabel'),
      }}
    >
      <div className="my-20 grid grid-cols-4 gap-x-8 gap-y-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => {
          const filteredBooks = categorizedBooks[category].filter((book) =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase())
          );

          // If no result, do not show an empty card.
          if (filteredBooks.length === 0) {
            return null;
          }

          return (
            <div>
              {filteredBooks.map((book, index) => (
                <Link
                  className="group z-10 m-auto mx-2 mb-5 h-fit w-20 min-w-[100px] delay-100 hover:z-20 hover:delay-0"
                  to={generatePath(Routes.Book, {
                    bookId: book.id.toString(),
                    language: book.language,
                  })}
                  key={book.id}
                >
                  <div className="z-10 mb-2 h-fit px-2 pt-2 transition duration-500 ease-in-out group-hover:scale-125 group-hover:bg-secondary-400">
                    <img
                      className="mx-auto"
                      src={book.cover}
                      alt={book.title}
                    />
                    <div className="wrap align-center inset-y-end font-light absolute inset-x-0 rounded-b-lg px-4 py-2 text-left text-xs text-white transition-colors duration-500 ease-in-out group-hover:bg-secondary-400">
                      <ul className="opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100">
                        <li className={'pb-1 text-lg font-bold'}>
                          {book.title}
                        </li>
                        <li className={'pb-1 text-xs italic'}>
                          {t('books.writtenBy', { host: book.title })}
                        </li>
                        <li className={'pb-1 text-xs italic'}>
                          {t('books.publishedIn', { date: '' })}
                        </li>
                        <li className={'truncate pb-1 text-xs'}>
                          {book.description}
                        </li>
                      </ul>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </ResourceLayout>
  );
};
