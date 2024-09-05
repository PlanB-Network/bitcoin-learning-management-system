import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PageLayout } from '#src/components/PageLayout/index.tsx';

import { TabLinks } from '../-components/PublicCommunication/tab-links.tsx';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation();

  return (
    <PageLayout
      variant="light"
      footerVariant="light"
      title={t('publicCommunication.title')}
      description={t('publicCommunication.description')}
    >
      <TabLinks />
      {children}
    </PageLayout>
  );
};

export default Layout;
