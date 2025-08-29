import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PageLayout } from '#src/components/page-layout.js';

import { TabLinks } from '../-components/public-communication/tab-links.tsx';

interface BlogsAndNewsLayoutProps {
  children: ReactNode;
}

const BlogsAndNewsLayout = ({ children }: BlogsAndNewsLayoutProps) => {
  const { t } = useTranslation();

  return (
    <PageLayout
      title={t('publicCommunication.title')}
      description={t('publicCommunication.description')}
    >
      <TabLinks />
      {children}
    </PageLayout>
  );
};

export default BlogsAndNewsLayout;
