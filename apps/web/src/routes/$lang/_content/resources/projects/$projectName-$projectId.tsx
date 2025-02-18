import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsTwitterX } from 'react-icons/bs';
import { SlGlobe } from 'react-icons/sl';
import { z } from 'zod';

import { Button, Loader, cn } from '@blms/ui';

import Nostr from '#src/assets/icons/nostr.svg?react';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import Flag from '#src/molecules/Flag/index.js';
import { BackLink } from '#src/molecules/backlink.tsx';
import { assetUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { getNameAndIdFromUrlForNumbers } from '#src/services/utils.tsx';
import { ProjectCard } from '../-components/cards/project-card.js';
import { ProjectEvents } from '../-components/project-events.js';
import { ResourceLayout } from '../-components/resource-layout.js';

export const Route = createFileRoute(
  '/$lang/_content/resources/projects/$projectName-$projectId',
)({
  params: {
    parse: (params) => {
      const projectNameId = params['projectName-$projectId'];
      const { id, name } = getNameAndIdFromUrlForNumbers(projectNameId);

      return {
        lang: z.string().parse(params.lang),
        'projectName-$projectId': `${name}-${id}`,
        projectName: z.string().parse(name),
        projectId: z.number().int().parse(Number(id)),
      };
    },
    stringify: ({ lang, projectName, projectId }) => ({
      lang: lang,
      'projectName-$projectId': `${projectName}-${projectId}`,
    }),
  },
  component: Project,
});

function Project() {
  const { t, i18n } = useTranslation();
  const params = Route.useParams();
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();

  const isScreenMd = useGreater('sm');
  const { data: project, isFetched } = trpc.content.getProject.useQuery(
    {
      id: params.projectId,
      language: i18n.language ?? 'en',
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const { data: communities } = trpc.content.getProjects.useQuery(
    {
      language: i18n.language ?? 'en',
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const { data: events } = trpc.content.getRecentEvents.useQuery();

  const { data: proofreading } = trpc.content.getProofreading.useQuery({
    language: i18n.language,
    resourceId: params.projectId,
  });

  const filteredCommunities = communities
    ? communities
        .filter(
          (el) =>
            el.category.toLowerCase() === 'communities' &&
            el.name !== project?.name,
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const filteredEvents = events
    ? events.filter(
        (event) =>
          event.projectName === project?.name && event.startDate > new Date(),
      )
    : [];

  useEffect(() => {
    if (project && params.projectName !== formatNameForURL(project.name)) {
      navigate({
        to: `/resources/projects/${formatNameForURL(project.name)}-${project.id}`,
      });
    }
  }, [project, isFetched, navigateTo404, navigate, params.projectName]);
  const isOriginalLanguage = project?.language === project?.originalLanguage;
  return (
    <ResourceLayout
      link={'/resources/projects'}
      activeCategory="projects"
      showPageHeader={false}
      backToCategoryButton
      showResourcesDropdownMenu={false}
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !project && (
        <div className="max-w-[768px] mx-auto text-white">
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.project'),
          })}
        </div>
      )}
      {project && (
        <>
          <BackLink to={'/resources/projects'} label={t('words.projects')} />
          <article className="w-full border-2 border-darkOrange-5 bg-darkOrange-10 rounded-[1.25rem] mb-7 md:mb-24">
            {proofreading ? (
              <ProofreadingProgress
                isOriginalLanguage={isOriginalLanguage}
                mode="dark"
                proofreadingData={{
                  contributors: proofreading.contributorsId,
                  reward: proofreading.reward,
                }}
              />
            ) : (
              <></>
            )}
            <section className="flex p-2 md:p-[30px]">
              <div className="flex flex-col gap-3">
                <img
                  src={assetUrl(project.path, 'logo.webp')}
                  className="rounded-2xl md:rounded-3xl size-[84px] md:size-[276px] shadow-card-items-dark"
                  alt={t('imagesAlt.sthRepresentingCompany')}
                />
                <div className="flex justify-center gap-2.5 md:hidden">
                  {project.languages?.slice(0, 2).map((language) => (
                    <Flag
                      code={language}
                      key={language}
                      className="!w-[26px] !h-[18px] shadow-card-items-dark"
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col md:gap-6 ml-4 md:ml-10">
                <h2 className="text-2xl md:text-5xl md:font-medium leading-none md:leading-[116%] text-white">
                  {project.name}
                </h2>

                {/* Links */}
                <div className="flex gap-4 md:gap-5 text-white max-md:mt-2">
                  {project.twitterUrl && (
                    <a
                      href={project.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BsTwitterX size={isScreenMd ? 32 : 16} />
                    </a>
                  )}
                  {project.nostr && (
                    <a
                      href={project.nostr}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Nostr
                        className={cn(
                          'fill-white',
                          isScreenMd ? 'size-8' : 'size-4',
                        )}
                      />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BsGithub size={isScreenMd ? 32 : 16} />
                    </a>
                  )}
                  {project.websiteUrl && (
                    <a
                      href={project.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SlGlobe size={isScreenMd ? 32 : 16} />
                    </a>
                  )}
                </div>
                {(project.addressLine1 ||
                  project.addressLine2 ||
                  project.addressLine3) && (
                  <div className="flex flex-col mobile-caption1 max-md:leading-tight md:desktop-h6 text-white max-md:mt-2 !font-normal">
                    <span>{project.addressLine1}</span>
                  </div>
                )}
                <div className="flex gap-2.5 md:gap-4 items-center flex-wrap max-md:mt-1.5">
                  {project.tags?.map((tag) => (
                    <Button
                      variant="transparent"
                      key={tag}
                      className="cursor-default capitalize shadow-card-items-dark"
                      size={isScreenMd ? 'm' : 'xs'}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="ml-auto flex flex-col gap-3 max-md:hidden">
                {project.category === 'communities' && (
                  <>
                    <span className="text-xs font-medium text-white text-center mb-1">
                      {t('projects.languages')}
                    </span>
                    <div className="flex justify-center flex-col gap-2.5 ">
                      {project.languages?.slice(0, 3).map((language) => (
                        <Flag
                          code={language}
                          key={language}
                          className="!w-[70px] !h-[49px] shadow-card-items-dark"
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
            <p className="mobile-body2 md:desktop-h8 whitespace-pre-line text-white p-2.5 md:p-5 break-words">
              {project.description}
            </p>
          </article>
          {project.category === 'communities' && (
            <ProjectEvents events={filteredEvents} />
          )}
        </>
      )}
      {project?.category === 'communities' && (
        <div className="flex flex-col items-center gap-4 md:gap-14">
          <div className="max-md:hidden h-px bg-newGray-1 w-full" />
          <div className="text-center">
            <span className="text-darkOrange-5 max-md:text-xs max-md:font-medium max-md:leading-normal md:desktop-h7">
              {t('projects.networkStrength')}
            </span>
            <h3 className="text-white mobile-h3 md:desktop-h3">
              {t('projects.otherCommunities')}
            </h3>
          </div>
          <div className="max-w-[1017px] flex flex-row flex-wrap justify-center items-center gap-4 md:gap-11">
            {filteredCommunities.map((community) => (
              <Link
                to={`/resources/projects/${formatNameForURL(community.name)}-${community.id}`}
                key={community.id}
              >
                <ProjectCard
                  name={community.name}
                  logo={assetUrl(community.path, 'logo.webp')}
                  cardWidth="w-[50px] md:w-[90px]"
                />
              </Link>
            ))}
          </div>
          <div className="max-md:hidden h-px bg-newGray-1 w-full" />
        </div>
      )}
    </ResourceLayout>
  );
}
