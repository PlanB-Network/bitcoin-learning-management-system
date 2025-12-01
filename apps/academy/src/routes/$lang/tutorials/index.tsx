import { Loader } from '@blms/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useState } from 'react';
import { TbChevronRight } from 'react-icons/tb';
import { PageLayout } from '#src/components/page-layout.tsx';
import { SearchInput } from '#src/components/search-input.tsx';
import { AppContext } from '#src/providers/context.js';
import { TUTORIALS_CATEGORIES } from '#src/services/utils.tsx';
import { TutorialCard } from './-components/tutorial-card.tsx';

export const Route = createFileRoute('/$lang/tutorials/')({
  component: TutorialExplorer,
});

function TutorialExplorer() {
  const [searchTerm, setSearchTerm] = useState('');

  const { tutorials } = useContext(AppContext);
  const isFetchedTutorials = tutorials && tutorials.length > 0;

  return (
    <PageLayout
      layoutSize="base"
      title={t('words.tutorials')}
      tabs={tutorialsTabs}
    >
      {!isFetchedTutorials && <Loader size={'s'} />}
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        className="ml-auto mb-4"
        fullWidthOnMobile
      />
      <div className="flex flex-col gap-6 md:gap-12 w-full">
        {TUTORIALS_CATEGORIES.map((category) => {
          const filteredTutorials = tutorials
            ?.filter(
              (tutorial) =>
                tutorial.category.toLowerCase() === category.name &&
                tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .sort((a, b) => b.likeCount - a.likeCount);

          if (!filteredTutorials || filteredTutorials.length === 0) {
            return null;
          }

          return (
            <section key={category.name} className="flex flex-col gap-2 w-full">
              <div className="flex w-full justify-between items-center md:px-2">
                <span className="flex display-small md:display-base">
                  {t(`tutorials.${category.name}.title`)}
                </span>
                <Link
                  to={`/tutorials/${category.name}`}
                  className="body-base-bold text-orange-500 flex items-center gap-2"
                >
                  {t('words.seeAll')}
                  <TbChevronRight size={16} />
                </Link>
              </div>
              <div className="flex flex-col w-full md:gap-2">
                {filteredTutorials.slice(0, 4).map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </PageLayout>
  );
}

export const tutorialsTabs = [
  {
    id: 'all',
    label: t('words.all'),
    href: '/tutorials',
  },
  ...TUTORIALS_CATEGORIES.map((category) => ({
    id: category.name,
    label: t(`tutorials.${category.name}.title`),
    href: category.route,
  })),
];
