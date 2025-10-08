import type { ReactNode } from 'react';

import { PageLayout } from '#src/components/page-layout.js';
import { TabLinks } from './-components/tab-links.tsx';

interface BlogsAndNewsLayoutProps {
  children: ReactNode;
}

const NewsLayout = ({ children }: BlogsAndNewsLayoutProps) => {
  return (
    <PageLayout>
      <TabLinks />
      {children}
    </PageLayout>
  );
};

export default NewsLayout;
