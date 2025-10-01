import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { capitalize } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { PageLayout } from '#src/components/page-layout.tsx';
import { resourceImgUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';
import { SearchInput } from '../../learn-anytime/index.tsx';
import { ProjectCard } from '../-components/cards/project-card.js';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/_content/resources/projects/')({
  component: Projects,
});

function Projects() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: projects, isFetched } = useQuery(
    trpc.content.getProjects.queryOptions(
      {
        language: i18n.language ?? 'en',
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  const sortedProjects = projects
    ? projects.sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const categorizedProjects = {} as Record<string, typeof sortedProjects>;
  for (const project of sortedProjects) {
    if (!categorizedProjects[project.category]) {
      categorizedProjects[project.category] = [];
    }
    categorizedProjects[project.category].push(project);
  }

  const categories = [
    ...new Set(sortedProjects.map((project) => project.category)),
  ].sort((a, b) => a.localeCompare(b));

  return (
    <PageLayout
      title={t('resources.projects.title')}
      tabs={resourcesTabs}
      layoutSize="base"
      actionButtons={[
        {
          text: t('resources.projects.addProjects'),
          href: '/tutorials/contribution/resource/add-builder-b5834c46-6dcc-4064-8d68-1ef529991d3d',
        },
      ]}
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && (
        <div className="flex flex-col gap-5 max-sm:mt-4 mt-2 w-full">
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="ml-auto"
          />
          {categories.map((category) => {
            const filteredProjects = categorizedProjects[category].filter(
              (project) =>
                project.name.toLowerCase().includes(searchTerm.toLowerCase()),
            );

            if (filteredProjects.length === 0) {
              return null;
            }

            return (
              <details
                key={category}
                className="group border border-neutral-100 rounded-2xl w-full hover:cursor-pointer"
              >
                <summary className="[&::-webkit-details-marker]:hidden list-none px-4 py-3">
                  <h3 className="title-medium text-black flex items-center justify-between">
                    {capitalize(category)}
                    <MdKeyboardArrowDown
                      size={24}
                      className="group-open:-rotate-180 transition-transform ease-in-out"
                    />
                  </h3>
                </summary>
                <div className="p-4 max-md:grid grid-cols-2 md:flex flex-row flex-wrap max-md:items-center gap-3 md:gap-6 w-full">
                  {filteredProjects.map((project) => (
                    <Link
                      to={`/resources/projects/${formatNameForURL(project.name)}-${project.id}`}
                      params={{
                        projectId: project.id.toString(),
                      }}
                      key={project.id}
                    >
                      <ProjectCard
                        name={project.name}
                        logo={resourceImgUrl(project, 'logo.webp')}
                      />
                    </Link>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
