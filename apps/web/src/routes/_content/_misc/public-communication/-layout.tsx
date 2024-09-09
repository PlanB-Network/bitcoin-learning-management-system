import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PageLayout } from '#src/components/page-layout.js';

import { TabLinks } from '../-components/public-communication/tab-links.tsx';

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
