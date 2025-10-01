import { Loader } from '@blms/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext } from 'react';
import { TbChevronRight } from 'react-icons/tb';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.js';
import { TUTORIALS_CATEGORIES } from '../../../../services/utils.tsx';
import { TutorialCard } from './-components/tutorial-card.tsx';

export const Route = createFileRoute('/$lang/_content/tutorials/')({
  component: TutorialExplorer,
});

function TutorialExplorer() {
  const { tutorials } = useContext(AppContext);
  const isFetchedTutorials = tutorials && tutorials.length > 0;

  return (
    <PageLayout
      layoutSize="base"
      title={t('words.tutorials')}
      tabs={tutorialsTabs}
    >
      {!isFetchedTutorials && <Loader size={'s'} />}
      <div className="flex flex-col gap-6 md:gap-12 w-full mt-4 md:mt-0">
        {TUTORIALS_CATEGORIES.map((category) => {
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
                {tutorials
                  ?.filter(
                    (tutorial) =>
                      tutorial.category.toLowerCase() === category.name,
                  )
                  .sort((a, b) => b.likeCount - a.likeCount)
                  .slice(0, 4)
                  .map((tutorial) => (
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
