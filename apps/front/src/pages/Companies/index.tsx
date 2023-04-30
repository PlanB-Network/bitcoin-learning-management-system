import { Link } from 'react-router-dom';

import { MainLayout } from '../../components';
import { PageTitle } from '../../components/PageTitle';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';

export const Companies = () => {
  return (
    <MainLayout>
      <div>
        <PageTitle>Companies</PageTitle>

        <Link
          to={replaceDynamicParam(Routes.Company, { companyId: 'seedsigner' })}
        >
          Seedsigner
        </Link>
      </div>
    </MainLayout>
  );
};
