import { Link } from 'react-router-dom';

import { MainLayout } from '../../components';
import { PageTitle } from '../../components/PageTitle';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';

export const Library = () => {
  return (
    <MainLayout>
      <div>
        <PageTitle>Library</PageTitle>

        <Link
          to={replaceDynamicParam(Routes.Book, {
            bookId: 'the-sovereign-individual',
          })}
        >
          The sovereign Individual
        </Link>
      </div>
    </MainLayout>
  );
};
