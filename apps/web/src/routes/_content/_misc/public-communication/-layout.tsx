import type { ReactNode } from 'react';

import { PageLayout } from '#src/components/PageLayout/index.tsx';

import { TabLinks } from '../-components/PublicCommunication/tab-links.tsx';

interface LayoutProps {
  t: (key: string) => string;
  children: ReactNode;
}

const Layout = ({ t, children }: LayoutProps) => {
  return (
    <PageLayout
      variant="light"
      footerVariant="light"
      title={t('publicCommunication.title')}
      description={t('publicCommunication.description')}
    >
      <TabLinks t={t} />
      {children}
    </PageLayout>
  );
};

export default Layout;
