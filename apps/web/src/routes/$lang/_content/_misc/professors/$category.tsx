import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { DropdownMenu, Loader, Tabs, TabsList, TabsTrigger } from '@blms/ui';

import { PageLayout } from '#src/components/page-layout.js';
import { ProfessorCard } from '#src/components/professor-card.js';
import { formatNameForURL } from '#src/utils/string.js';
import { trpc } from '#src/utils/trpc.js';

import { useQuery } from '@tanstack/react-query';
import { professorTabs } from '../-utils/professor-utils.tsx';

export const Route = createFileRoute(
  '/$lang/_content/_misc/professors/$category',
)({
  params: {
    parse: (params) => ({
      lang: z.string().parse(params.lang),
      category: z.string().parse(params.category),
    }),
    stringify: ({ lang, category }) => ({
      lang: lang,
      category: `${category}`,
    }),
  },
  component: ProfessorCategoryPage,
});

export function ProfessorCategoryPage() {
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const navigate = useNavigate();

  const activeItem =
    professorTabs.find((tab) => tab.href.includes(params.category)) ||
    professorTabs[0];

  const dropdownItems = professorTabs.map((tab) => ({
    name: t(tab.label),
    onClick: () => {
      navigate({ to: tab.href });
    },
  }));

  const { data: professors, isFetched } = useQuery(
    trpc.content.getProfessors.queryOptions(
      {
        language: i18n.language,
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  const filteredProfessors = professors?.filter((professor) => {
    switch (params.category) {
      case 'all': {
        return (
          professor.coursesCount > 0 ||
          professor.tutorialsCount > 0 ||
          professor.lecturesCount > 0
        );
      }
      case 'teachers': {
        return professor.coursesCount && professor.coursesCount > 0;
      }
      case 'tutorial-creators': {
        return professor.tutorialsCount && professor.tutorialsCount > 0;
      }
      case 'lecturers': {
        return professor.lecturesCount > 0;
      }
      default: {
        return false;
      }
    }
  });

  const sortedProfessors = [...(filteredProfessors || [])].sort((a, b) =>
    a.name.localeCompare(b.name, i18n.language),
  );

  return (
    <PageLayout
      title={t('professors.pageTitle')}
      description={t('professors.pageSubtitle')}
    >
      <div className="lg:hidden max-w-[280px] mx-auto">
        <DropdownMenu
          activeItem={t(activeItem ? activeItem.label : '')}
          itemsList={dropdownItems}
          className="lg:hidden"
        />
      </div>
      <Tabs
        defaultValue={activeItem.label}
        className="w-full hidden lg:flex justify-center mt-7"
      >
        <TabsList size="l" mode="dark">
          {professorTabs.map((tab) => (
            <TabsTrigger
              value={tab.label}
              key={tab.id}
              size="l"
              role="tab"
              onClick={() => {
                if (activeItem.href !== tab.href) {
                  navigate({ to: tab.href });
                }
              }}
            >
              {t(tab.label)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="bg-black items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-[60px] lg:grid-cols-3  max-w-[300px] sm:max-w-[500px] md:max-w-[760px] lg:max-w-[1020px] mx-auto mt-4 lg:mt-32">
          {!isFetched && <Loader size={'s'} />}
          {sortedProfessors?.map((professor) => (
            <Link
              to={`/professor/${formatNameForURL(professor.name)}-${professor.id}`}
              key={professor.id}
              className="h-auto w-full sm:w-auto"
              hash={`${params.category}`}
            >
              <div className="h-full">
                <ProfessorCard professor={professor} className="h-full" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
