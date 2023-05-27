import { Link } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { Card } from '../../atoms/Card';
import { MainLayout } from '../../components';
import { PageTitle } from '../../components/PageTitle';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';

export const Library = () => {
  const books = trpc.content.getBooks.useQuery();

  return (
    <MainLayout>
      <div>
        <PageTitle>THE LIBRARY</PageTitle>
        <h3>
          This library is open-source & open to contribution. Thanks for grading
          and sharing !
        </h3>
        <div className="grid grid-cols-5">
          {books.data &&
            books.data.map((book, index) => {
              return (
                <Card>
                  <Link
                    to={replaceDynamicParam(Routes.Book, {
                      bookId: book.id.toString(),
                      language: book.language,
                    })}
                  >
                    <img src={book.cover} alt={book.title} />
                    {book.title}
                  </Link>
                </Card>
              );
            })}
        </div>
      </div>
    </MainLayout>
  );
};
