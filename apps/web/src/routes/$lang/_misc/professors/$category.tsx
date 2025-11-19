import {
  CategorySwitcher,
  CategorySwitcherBar,
  Loader,
  SegmentedControl,
  SegmentedControlItem,
} from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.js';
import { ProfessorCard } from '#src/components/professor-card.js';
import { trpc } from '#src/utils/trpc.js';
import { professorTabs } from '../-utils/professor-utils.tsx';

export const Route = createFileRoute('/$lang/_misc/professors/$category')({
  component: ProfessorCategoryPage,
  params: {
    parse: (params) => ({
      category: z.string().parse(params.category),
      lang: z.string().parse(params.lang),
    }),
    stringify: ({ lang, category }) => ({
      category: `${category}`,
      lang: lang,
    }),
  },
});

export function ProfessorCategoryPage() {
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const navigate = useNavigate();

  const activeItem =
    professorTabs.find((tab) => tab.href.includes(params.category)) ||
    professorTabs[0];

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
    <PageLayout title={t('professors.pageTitle')} layoutSize="wide">
      <SegmentedControl
        variant="outline"
        value={activeItem?.id ?? professorTabs[0].id}
        defaultValue={professorTabs[0].id}
        className="w-full max-lg:hidden mb-6"
      >
        {professorTabs.map((tab) => (
          <SegmentedControlItem
            key={tab.id}
            value={tab.id}
            onClick={() => navigate({ to: tab.href })}
            className="w-full min-w-fit"
          >
            {t(tab.label)}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      <div className="w-full lg:hidden mb-5">
        <CategorySwitcherBar>
          {professorTabs.map((tab) => (
            <CategorySwitcher
              key={tab.id}
              onClick={() => navigate({ to: tab.href })}
              isActive={activeItem?.id === tab.id}
              text={t(tab.label)}
            />
          ))}
        </CategorySwitcherBar>
      </div>

      <div className="flex flex-wrap gap-4 lg:gap-8 mx-auto justify-center">
        {!isFetched && <Loader size={'s'} />}
        {sortedProfessors?.map((professor) => (
          <ProfessorCard
            professor={professor}
            category={
              activeItem?.id && activeItem.id !== 'all'
                ? activeItem.id
                : undefined
            }
            key={professor.id}
          />
        ))}
      </div>

      <p className="body-extra-small lg:body-small text-neutral-600 text-center mt-4 lg:mt-12">
        {t('professors.pageSubtitle')}
      </p>
    </PageLayout>
  );
}
