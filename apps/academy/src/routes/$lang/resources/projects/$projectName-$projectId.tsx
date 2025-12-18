import { formatNameForURL } from '@blms/shared';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { type ReactNode, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TbBrandGithub,
  TbBrandLinkedin,
  TbBrandX,
  TbLink,
} from 'react-icons/tb';
import { z } from 'zod';
import Nostr from '#src/assets/icons/nostr.svg?react';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import { CourseCard } from '#src/patterns/course-card.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { TutorialCard } from '#src/routes/$lang/tutorials/-components/tutorial-card.tsx';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { resourceImgUrl } from '#src/utils/index.ts';
import { trpc } from '#src/utils/trpc.js';
import { ProjectCard } from '../-components/cards/project-card.js';
import { ResourceCard } from '../-components/cards/resource-card.tsx';
import { ProjectEvents } from '../-components/project-events.js';
import { ResourceDetails } from '../-components/resource-details.tsx';
import { ConferenceCard } from '../conferences/index.tsx';

export const Route = createFileRoute(
  '/$lang/resources/projects/$projectName-$projectId',
)({
  component: Project,
  params: {
    parse: (params) => {
      const projectNameId = params['projectName-$projectId'];
      const { id, name } = getNameAndIdFromUrl(projectNameId);

      return {
        lang: z.string().parse(params.lang),
        projectId: z.string().parse(id),
        projectName: z.string().parse(name),
        'projectName-$projectId': `${name}-${id}`,
      };
    },
    stringify: ({ lang, projectName, projectId }) => ({
      lang: lang,
      'projectName-$projectId': `${projectName}-${projectId}`,
    }),
  },
});

function Project() {
  const { t, i18n } = useTranslation();
  const params = Route.useParams();
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();

  const { tutorials, courses } = useContext(AppContext);

  const { data: project, isFetched } = useQuery(
    trpc.content.getProject.queryOptions(
      {
        id: params.projectId,
        language: i18n.language ?? 'en',
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  const { data: communities } = useQuery(
    trpc.content.getProjects.queryOptions(
      {
        language: i18n.language ?? 'en',
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  const { data: events } = useQuery(
    trpc.content.getRecentEvents.queryOptions(),
  );

  const { data: conferenceReplays } = useQuery(
    trpc.content.getConferences.queryOptions({
      projectId: params.projectId,
    }),
  );

  const { data: newsletters } = useQuery(
    trpc.content.getNewsletters.queryOptions({
      projectId: params.projectId,
    }),
  );

  const { data: youtubeChannels } = useQuery(
    trpc.content.getYoutubeChannels.queryOptions({
      projectId: params.projectId,
    }),
  );

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

  const filteredTutorials = tutorials
    ? tutorials.filter((tutorial) => tutorial.projectId === project?.id)
    : [];

  const filteredCourses = courses
    ? courses.filter((course) => course.projectName === project?.name)
    : [];

  useEffect(() => {
    if (project && params.projectName !== formatNameForURL(project.name)) {
      navigate({
        replace: true,
        to: `/resources/projects/${formatNameForURL(project.name)}-${project.id}`,
      });
    }
  }, [project, isFetched, navigateTo404, navigate, params.projectName]);

  return (
    <PageLayout
      backLink={{ href: '/resources/projects', text: t('words.projects') }}
      layoutSize="wide"
      title={project?.name ?? undefined}
      hideTitle
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !project && (
        <div>
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.project'),
          })}
        </div>
      )}
      {project && (
        <>
          <ResourceDetails
            title={project.name}
            imgSrc={resourceImgUrl(project, 'logo.webp')}
            subtitle={project.addressLine1 || undefined}
            mediaLinks={[
              ...(project.twitterUrl
                ? [
                    {
                      icon: TbBrandX,
                      href: project.twitterUrl,
                    },
                  ]
                : []),
              ...(project.websiteUrl
                ? [
                    {
                      icon: TbLink,
                      href: project.websiteUrl,
                    },
                  ]
                : []),
              ...(project.githubUrl
                ? [
                    {
                      icon: TbBrandGithub,
                      href: project.githubUrl,
                    },
                  ]
                : []),
              ...(project.linkedinUrl
                ? [
                    {
                      icon: TbBrandLinkedin,
                      href: project.linkedinUrl,
                    },
                  ]
                : []),
              ...(project.nostr
                ? [
                    {
                      icon: Nostr,
                      href: project.nostr,
                    },
                  ]
                : []),
            ]}
            tags={project.tags}
            language={project.languages}
          />

          <p className="whitespace-pre-line body-small md:body-base text-justify mt-6">
            {project.description}
          </p>

          {filteredEvents.length > 0 && (
            <ProjectEvents events={filteredEvents} />
          )}

          {filteredCourses.length > 0 && (
            <RelatedResource category={t('words.courses')}>
              <div className="flex flex-wrap gap-2 md:gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} mode="light" />
                ))}
              </div>
            </RelatedResource>
          )}

          {filteredTutorials.length > 0 && (
            <RelatedResource category={t('words.tutorials')}>
              <div className="flex flex-wrap gap-2">
                {filteredTutorials.map((tutorial) => (
                  <TutorialCard tutorial={tutorial} key={tutorial.id} />
                ))}
              </div>
            </RelatedResource>
          )}

          {conferenceReplays && conferenceReplays.length > 0 && (
            <RelatedResource category={t('resources.conferences.title')}>
              <div className="flex flex-wrap gap-2 md:gap-6">
                {conferenceReplays.map((conference) => (
                  <ConferenceCard key={conference.id} conference={conference} />
                ))}
              </div>
            </RelatedResource>
          )}

          {newsletters && newsletters.length > 0 && (
            <RelatedResource category={t('resources.newsletters.title')}>
              <div className="flex flex-wrap gap-2 md:gap-6">
                {newsletters.map((newsletter) => (
                  <Link
                    to={`/resources/newsletters/${formatNameForURL(
                      newsletter.title,
                    )}-${newsletter.id}`}
                    params={{
                      newsletterId: newsletter.id.toString(),
                    }}
                    key={`${newsletter.id}`}
                  >
                    <ResourceCard
                      name={newsletter.title}
                      author={newsletter.author}
                      imageSrc={resourceImgUrl(newsletter)}
                      language={newsletter.language}
                    />
                  </Link>
                ))}
              </div>
            </RelatedResource>
          )}

          {youtubeChannels && youtubeChannels.length > 0 && (
            <RelatedResource category={t('resources.channels.title')}>
              <div className="flex flex-wrap gap-2 md:gap-6">
                {youtubeChannels.map((youtubeChannel) => (
                  <Link
                    to={`/resources/channels/${formatNameForURL(youtubeChannel.name)}-${youtubeChannel.id}`}
                    params={{ youtubeChannelId: youtubeChannel.id.toString() }}
                    key={`${youtubeChannel.id}`}
                  >
                    <ResourceCard
                      name={youtubeChannel.name}
                      imageSrc={resourceImgUrl(youtubeChannel)}
                      language={youtubeChannel.language}
                    />
                  </Link>
                ))}
              </div>
            </RelatedResource>
          )}
        </>
      )}

      {project?.category === 'communities' && (
        <div className="flex flex-col gap-1 md:gap-7.5 mt-6 md:mt-13.5">
          <h3 className="subtitle-base md:title-large">
            {t('projects.otherCommunities')}
          </h3>
          <div className="max-md:grid grid-cols-2 md:flex flex-row flex-wrap max-md:items-center gap-3 md:gap-6 w-full">
            {filteredCommunities.map((community) => (
              <Link
                to={`/resources/projects/${formatNameForURL(community.name)}-${community.id}`}
                key={community.id}
              >
                <ProjectCard
                  name={community.name}
                  logo={resourceImgUrl(community, 'logo.webp')}
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}

const RelatedResource = ({
  category,
  children,
}: {
  category: string;
  children: ReactNode | ReactNode[];
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1 md:gap-7.5 mt-6 md:mt-13.5">
      <h3 className="flex items-center gap-1 subtitle-base md:title-large">
        {t('projects.related')} <span>{category.toLocaleLowerCase()}</span>
      </h3>
      {children}
    </div>
  );
};
