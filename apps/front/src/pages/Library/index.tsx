import { Link, generatePath } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { ResourceLayout } from '../../components/ResourceLayout';
import { Routes } from '../../types';

export const Library = () => {
  const books = trpc.content.getBooks.useQuery();

  return (
    <ResourceLayout
      title="The Library"
      tagLine="This library is open-source & open to contribution. Thanks for grading
      and sharing !"
      filterBar={{
        onChange: () => undefined,
        label: 'Find the perfect resources for your needs:',
      }}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {books.data &&
          books.data.map((book) => {
            return (
              <Link
                to={generatePath(Routes.Book, {
                  bookId: book.id.toString(),
                  language: book.language,
                })}
              >
                <div className="hover:border-secondary-400 box-border flex h-full flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-gray-100 p-2 shadow duration-200 hover:scale-95">
                  <img
                    className="max-h-80 max-w-full rounded-t-lg"
                    src={book.cover}
                    alt={book.title}
                  />
                  <h3 className="mt-4 text-center">{book.title}</h3>
                </div>
              </Link>
            );
          })}
      </div>
    </ResourceLayout>
  );
};
