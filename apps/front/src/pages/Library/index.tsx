import { Link } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { RessourceLayout } from '../../components/RessourceLayout';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';

export const Library = () => {
  const books = trpc.content.getBooks.useQuery();

  return (
    <RessourceLayout
      title="The Library"
      tagLine="This library is open-source & open to contribution. Thanks for grading
      and sharing !"
      filterBar={{
        onChange: () => {},
        label: 'Find the perfect resources for your needs:',
      }}
    >
      <div className="grid grid-cols-2 gap-y-4 gap-x-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {books.data &&
          books.data.map((book) => {
            return (
              <Link
                to={replaceDynamicParam(Routes.Book, {
                  bookId: book.id.toString(),
                  language: book.language,
                })}
              >
                <div className="box-border flex flex-col items-center justify-between h-full p-2 duration-200 bg-gray-100 border-2 border-gray-200 shadow rounded-xl hover:border-secondary-400 hover:scale-95">
                  <img
                    className="max-w-full rounded-t-lg max-h-80"
                    src={book.cover}
                    alt={book.title}
                  />
                  <h3 className="mt-4 text-center">{book.title}</h3>
                </div>
              </Link>
            );
          })}
      </div>
    </RessourceLayout>
  );
};
