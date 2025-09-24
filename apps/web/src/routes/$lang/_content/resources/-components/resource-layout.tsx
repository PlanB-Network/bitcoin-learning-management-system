import type { ReactNode } from 'react';
import { PageLayout } from '#src/components/page-layout.tsx';
import { RESOURCES_CATEGORIES } from '#src/services/utils.tsx';

interface Props {
  children: ReactNode | ReactNode[];
  title: string;
}

export const ResourceLayout = ({ children, title }: Props) => {
  return (
    <PageLayout
      tabs={[
        {
          id: 'all',
          label: 'words.all',
          href: '/resources',
        },
        ...RESOURCES_CATEGORIES.map((resourceCategory) => {
          return {
            id: resourceCategory.name,
            label: `resources.${resourceCategory.name}.title`,
            href: `/resources/${resourceCategory.name}`,
          };
        }),
      ]}
      layoutSize="base"
      title={title}
    >
      {children}
    </PageLayout>
  );
};
