import { Link } from 'react-router-dom';

import { MainLayout } from '../../components';
import { PageTitle } from '../../components/PageTitle';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';

export const Builders = () => {
  return (
    <MainLayout>
      <div>
        <PageTitle>Builders</PageTitle>

        <Link
          to={replaceDynamicParam(Routes.Builder, { builderId: 'seedsigner' })}
        >
          Seedsigner
        </Link>
      </div>
    </MainLayout>
  );
};
