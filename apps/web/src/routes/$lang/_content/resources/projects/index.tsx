import { Link, createFileRoute } from '@tanstack/react-router';
import { capitalize } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { Loader } from '@blms/ui';

import { resourceImgUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { useQuery } from '@tanstack/react-query';
import { ProjectCard } from '../-components/cards/project-card.js';
import { ResourceLayout } from '../-components/resource-layout.js';

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
    <ResourceLayout
      title={t('projects.pageTitle')}
      filterBar={{
        onChange: setSearchTerm,
      }}
      activeCategory="projects"
    >
      {!isFetched && <Loader size={'s'} />}
      <div className="flex flex-col gap-5 p-4 pt-0 md:p-10 md:pt-0">
        {categories.map((category) => {
          const filteredProjects = categorizedProjects[category].filter(
            (project) =>
              project.name.toLowerCase().includes(searchTerm.toLowerCase()),
          );

          if (filteredProjects.length === 0) {
            return null;
          }

          return (
            <details key={category} className="group">
              <summary className="border-b border-newGray-1 [&::-webkit-details-marker]:hidden list-none">
                <h3 className="text-white group-open:font-semibold md:text-2xl flex items-center gap-5">
                  {capitalize(category)}
                  <MdKeyboardArrowDown
                    size={24}
                    className="group-open:-rotate-180 transition-transform ease-in-out"
                  />
                </h3>
              </summary>
              <div className="mt-5 flex flex-row flex-wrap justify-center items-center gap-4 md:gap-11">
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
    </ResourceLayout>
  );
}
