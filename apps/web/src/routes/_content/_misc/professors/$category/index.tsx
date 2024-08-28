import { Link, createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { PageLayout } from '#src/components/PageLayout/index.tsx';
import { ProfessorCard } from '#src/components/professor-card.js';
import { formatNameForURL } from '#src/utils/string.js';
import { trpc } from '#src/utils/trpc.js';

import { DropdownMenu } from '../../../resources/-components/DropdownMenu/dropdown-menu.tsx';
import { professorTabs } from '../index.tsx';

export const Route = createFileRoute('/_content/_misc/professors/$category/')({
  component: ProfessorCategoryPage,
});

export function ProfessorCategoryPage() {
  const { t, i18n } = useTranslation();
  const { category } = useParams({ from: '/professors/$category/' });

  const activeItem =
    professorTabs.find((tab) => tab.href.includes(category)) ||
    professorTabs[0];

  const dropdownItems = professorTabs.map((tab) => ({
    name: t(tab.label),
    onClick: () => {
      window.location.href = tab.href;
    },
  }));

  const { data: professors, isFetched } = trpc.content.getProfessors.useQuery(
    {
      language: i18n.language,
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const filteredProfessors = professors?.filter((professor) => {
    switch (category) {
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
        return (
          professor.coursesCount === 0 &&
          professor.tutorialsCount === 0 &&
          professor.lecturesCount > 0
        );
      }
      default: {
        return false;
      }
    }
  });

  return (
    <PageLayout
      title={t('professors.pageTitle')}
      description={t('professors.pageSubtitle')}
    >
      <div className="lg:hidden max-w-[280px] mx-auto">
        <DropdownMenu
          activeItem={t(activeItem ? activeItem.label : '')}
          itemsList={dropdownItems}
        />
      </div>
      <div
        className="hidden lg:flex flex-row justify-center mx-auto max-w-2xl lg:mt-7 space-x-5 transition-all duration-300"
        aria-label="Professor navigation"
        role="tablist"
      >
        {professorTabs.map((tab) => (
          <Link
            to={tab.href}
            key={tab.id}
            className="lg:py-3.5 lg:text-xl font-normal text-base rounded-[3px] text-white py-2 transition-all duration-300 relative"
            activeProps={{
              className:
                'text-black font-bold before:bg-darkOrange-5 before:rounded-full before:w-full before:h-1 before:absolute before:bottom-0 before:left-0',
            }}
            inactiveProps={{
              className:
                'hover:before:bg-[#333333] hover:before:rounded-full  hover:before:w-full  hover:before:h-1  hover:before:absolute  before:bottom-0 before:left-0 text-[#050A14]',
            }}
            value={tab.label}
            role="tab"
          >
            {t(tab.label)}
          </Link>
        ))}
      </div>

      <div className="bg-black items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-16 lg:grid-cols-3  max-w-[300px] sm:max-w-[500px] md:max-w-[760px] lg:max-w-[1020px] mx-auto py-4 lg:py-32">
          {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
          {filteredProfessors?.map((professor) => (
            <Link
              to={`/professor/${formatNameForURL(professor.name)}-${professor.id}`}
              key={professor.id}
              className="h-auto w-full sm:w-auto"
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
