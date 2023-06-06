import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { ResourceLayout } from '../../components';
import { Routes } from '../../types';

export const Books = () => {
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
      title={t('library.pageTitle')}
      tagLine={t('library.pageSubtitle')}
      filterBar={{
        onChange: () => setSearchTerm,
        label: t('resources.filterBarLabel'),
      }}
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-8 lg:grid-cols-5">
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
                  className="group z-10 m-auto mx-2 h-fit w-20 min-w-[100px] delay-100 hover:z-20 hover:delay-0"
                  to={generatePath(Routes.Book, {
                    bookId: book.id.toString(),
                    language: book.language,
                  })}
                  key={book.id}
                >
                  <div className="group-hover:bg-secondary-400 z-10 mb-2 h-fit px-2 pt-2 transition duration-500 ease-in-out group-hover:scale-125">
                    <img
                      className="mx-auto"
                      src={book.cover}
                      alt={book.title}
                    />
                    <div className="group-hover:bg-secondary-400 absolute inset-x-0 rounded-b-lg px-4 py-2 text-left text-xs font-thin text-white transition-colors duration-500 ease-in-out">
                      <ul className="opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100">
                        <li className={'pb-1 text-lg font-bold'}>
                          {book.title}
                        </li>
                        {book.author && (
                          <li className={'pb-1 text-xs italic'}>
                            {t('library.writtenBy', { author: book.author })}
                          </li>
                        )}
                        {book.publication_year && (
                          <li className={'pb-1 text-xs italic'}>
                            {t('library.publishedIn', {
                              date: book.publication_year,
                            })}
                          </li>
                        )}
                        {/* <li className={'truncate pb-1 text-xs'}>
                          {book.description}
                        </li> */}
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
