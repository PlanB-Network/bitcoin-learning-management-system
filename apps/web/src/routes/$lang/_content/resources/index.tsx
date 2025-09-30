import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TbChevronRight } from 'react-icons/tb';
import { CategoryIcon } from '#src/components/category-icon.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { RESOURCES_CATEGORIES } from '#src/services/utils.js';

export const Route = createFileRoute('/$lang/_content/resources/')({
  component: Resources,
});

function Resources() {
  const { t } = useTranslation();

  return (
    <PageLayout
      title={t('words.resources')}
      tabs={resourcesTabs}
      layoutSize="base"
    >
      {RESOURCES_CATEGORIES.map((category) => (
        <Link
          to={`/resources/${category.name}`}
          key={category.name}
          className="w-full flex items-center justify-between px-2 py-4 hover:bg-neutral-50 rounded-2xl"
        >
          <div className="flex gap-6 items-center">
            <CategoryIcon src={category.image} variant="resources" />
            <span className="body-base-bold md:subtitle-base text-black">
              {t(`resources.${category.name}.title`)}
            </span>
          </div>
          <TbChevronRight className="text-neutral-300" size={20} />
        </Link>
      ))}
    </PageLayout>
  );
}

export const resourcesTabs = [
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
];
