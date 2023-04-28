import { Link } from 'react-router-dom';

import { MainLayout } from '../../components';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';

export const Companies = () => {
  return (
    <MainLayout>
      <div>
        <h1>Companies</h1>
        <Link
          to={replaceDynamicParam(Routes.Company, { companyId: 'seedsigner' })}
        >
          Seedsigner
        </Link>
      </div>
    </MainLayout>
  );
};
