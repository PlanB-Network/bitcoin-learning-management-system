import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { Fragment, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsTwitterX } from 'react-icons/bs';
import { SlGlobe } from 'react-icons/sl';
import { z } from 'zod';

import BookPixel from '#src/assets/icons/book-pixelated.svg?react';
import newsletterSvg from '#src/assets/icons/world-pixelated.svg';
import conferenceSvg from '#src/assets/resources/conference.svg';
import youtubeSvg from '#src/assets/resources/youtube.svg';
import tutorialsSvg from '#src/assets/tutorials/other.svg';

import { Button, Loader, cn } from '@blms/ui';

import Nostr from '#src/assets/icons/nostr.svg?react';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import Flag from '#src/molecules/Flag/index.js';
import { BackLink } from '#src/molecules/backlink.tsx';
import { resourceImgUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { VerticalCard } from '#src/molecules/vertical-card.tsx';
import { CourseCard } from '#src/organisms/course-card.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { ProjectCard } from '../-components/cards/project-card.js';
import { ResourceCard } from '../-components/cards/resource-card.tsx';
import { ProjectEvents } from '../-components/project-events.js';
import { ResourceLayout } from '../-components/resource-layout.js';
import { TutorialCard } from '../../tutorials/-components/tutorial-card.tsx';

export const Route = createFileRoute(
  '/$lang/_content/resources/projects/$projectName-$projectId',
)({
  params: {
    parse: (params) => {
      const projectNameId = params['projectName-$projectId'];
      const { id, name } = getNameAndIdFromUrl(projectNameId);

      return {
        lang: z.string().parse(params.lang),
        'projectName-$projectId': `${name}-${id}`,
        projectName: z.string().parse(name),
        projectId: z.string().parse(id),
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

  const { tutorials, courses } = useContext(AppContext);

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

  const { data: conferenceReplays } = trpc.content.getConferences.useQuery({
    projectId: params.projectId,
  });

  const { data: newsletters } = trpc.content.getNewsletters.useQuery({
    projectId: params.projectId,
  });

  const { data: youtubeChannels } = trpc.content.getYoutubeChannels.useQuery({
    projectId: params.projectId,
  });

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

  const filteredTutorials = tutorials
    ? tutorials.filter((tutorial) => tutorial.projectId === project?.id)
    : [];

  const filteredCourses = courses
    ? courses.filter((course) => course.projectName === project?.name)
    : [];

  useEffect(() => {
    if (project && params.projectName !== formatNameForURL(project.name)) {
      navigate({
        to: `/resources/projects/${formatNameForURL(project.name)}-${project.id}`,
        replace: true,
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
          <article className="w-full border-2 border-darkOrange-5 bg-darkOrange-10 rounded-[1.25rem] mb-7 md:mb-20">
            {proofreading ? (
              <ProofreadingProgress
                isOriginalLanguage={isOriginalLanguage}
                mode="dark"
                proofreadingData={{
                  contributors: proofreading.contributorNames,
                  reward: proofreading.reward,
                }}
              />
            ) : (
              <></>
            )}
            <section className="flex p-2 md:p-[30px]">
              <div className="flex flex-col gap-3">
                <img
                  src={resourceImgUrl(project, 'logo.webp')}
                  className="rounded-2xl md:rounded-3xl size-[84px] md:size-[276px] shadow-card-items-dark"
                  alt={t('imagesAlt.sthRepresentingCompany')}
                />
                <div className="flex justify-center gap-2.5 md:hidden">
                  {project.languages?.slice(0, 2).map((language) => (
                    <Flag
                      code={language}
                      key={language}
                      size="m"
                      className="!w-[26px] !h-[18px] shadow-card-items-dark"
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col md:gap-6 ml-4 md:ml-10">
                <h2 className="title-large-24px lg:display-small-med-32px text-white">
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
                  <div className="flex justify-center flex-col gap-2.5 ">
                    {project.languages?.slice(0, 3).map((language) => (
                      <Flag
                        code={language}
                        key={language}
                        size="xl"
                        className="shrink-0 max-md:hidden"
                      />
                    ))}
                  </div>
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
          {filteredCourses.length > 0 && (
            <div className="flex flex-col items-center gap-4 md:gap-10 mb-7 md:mb-14">
              <h3 className="flex items-center text-center title-small-med-16px text-white md:title-large-24px">
                <BookPixel className="mr-3 size-5 md:size-8 fill-darkOrange-5" />
                {t('projects.related')}{' '}
                <span className="ml-1 text-darkOrange-5">
                  {t('words.courses')}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-6 justify-center">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} mode="dark" />
                ))}
              </div>
            </div>
          )}
          {filteredTutorials.length > 0 && (
            <div className="flex flex-col items-center gap-4 md:gap-10 mb-7 md:mb-14">
              <h3 className="flex items-center text-center title-small-med-16px text-white md:title-large-24px">
                <img
                  className="mr-3 size-5 md:size-8"
                  src={tutorialsSvg}
                  alt="Tutorials"
                />
                {t('projects.related')}{' '}
                <span className="ml-1 text-darkOrange-5">
                  {t('words.tutorials')}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-x-0 md:gap-y-6 justify-center max-w-[840px]">
                {filteredTutorials.map((tutorial) => (
                  <TutorialCard
                    href={`/tutorials/${tutorial.category}/${tutorial.subcategory}/${tutorial.name}-${tutorial.id}`}
                    dark
                    tutorial={tutorial}
                    key={tutorial.id}
                  />
                ))}
              </div>
            </div>
          )}
          {conferenceReplays && conferenceReplays.length > 0 && (
            <div className="flex flex-col items-center gap-4 md:gap-10 mb-7 md:mb-14">
              <h3 className="flex items-center text-center title-small-med-16px text-white md:title-large-24px">
                <img
                  className="mr-3 size-5 md:size-8"
                  src={conferenceSvg}
                  alt="Conferences replays"
                />
                {t('projects.related')}{' '}
                <span className="ml-1 text-darkOrange-5">
                  {t('resources.conferences.title')}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-5 justify-center w-full">
                {conferenceReplays.map((conference) => (
                  <VerticalCard
                    key={conference.id}
                    imageSrc={resourceImgUrl(conference)}
                    imgClassName="w-full mb-1 rounded-lg md:rounded-2xl"
                    title={conference.name}
                    subtitle={conference.location}
                    buttonText={t('events.card.watchReplay')}
                    buttonVariant="primary"
                    buttonLink={
                      conference.stages.length > 0
                        ? `/resources/conferences/${formatNameForURL(conference.name)}-${conference.id}`
                        : ''
                    }
                    languages={conference.languages}
                    className="max-w-[137px] md:max-w-[317px]"
                  />
                ))}
              </div>
            </div>
          )}
          {newsletters && newsletters.length > 0 && (
            <div className="flex flex-col items-center gap-4 md:gap-10 mb-7 md:mb-14">
              <h3 className="flex items-center text-center title-small-med-16px text-white md:title-large-24px">
                <img
                  className="mr-3 size-5 md:size-8"
                  src={newsletterSvg}
                  alt="Newsletters"
                />
                {t('projects.related')}{' '}
                <span className="ml-1 text-darkOrange-5">
                  {t('resources.newsletters.title')}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-5 justify-center w-full">
                {newsletters.map((newsletter) => (
                  <Link
                    to={`/resources/newsletters/${formatNameForURL(
                      newsletter.title,
                    )}-${newsletter.id}`}
                    params={{
                      newsletterId: newsletter.id.toString(),
                    }}
                    key={`${newsletter.id}`}
                    className="grow md:grow-0"
                  >
                    <ResourceCard
                      name={newsletter.title}
                      author={newsletter.author}
                      imageSrc={resourceImgUrl(newsletter)}
                      language={newsletter.language}
                      level={newsletter?.level ? newsletter.level : undefined}
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {youtubeChannels && youtubeChannels.length > 0 && (
            <div className="flex flex-col items-center gap-4 md:gap-10 mb-7 md:mb-14">
              <h3 className="flex items-center text-center title-small-med-16px text-white md:title-large-24px">
                <img
                  className="mr-3 size-5 md:size-8"
                  src={youtubeSvg}
                  alt="Youtube channels"
                />
                {t('projects.related')}{' '}
                <span className="ml-1 text-darkOrange-5">
                  {t('resources.channels.title')}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-5 justify-center w-full">
                {youtubeChannels.map((youtubeChannel) => (
                  <Fragment key={youtubeChannel.id}>
                    <Link
                      to={`/resources/channels/${formatNameForURL(youtubeChannel.name)}-${youtubeChannel.id}`}
                      params={{
                        youtubeChannelId: youtubeChannel.id.toString(),
                      }}
                      className="grow md:grow-0 max-md:hidden"
                    >
                      <ResourceCard
                        name={youtubeChannel.name}
                        imageSrc={resourceImgUrl(youtubeChannel)}
                        language={youtubeChannel.language}
                      />
                    </Link>
                    <VerticalCard
                      imageSrc={resourceImgUrl(youtubeChannel)}
                      title={youtubeChannel.name}
                      buttonVariant="primary"
                      buttonLink={`/resources/channels/${formatNameForURL(youtubeChannel.name)}-${youtubeChannel.id}`}
                      buttonText={t('words.viewMore')}
                      languages={[youtubeChannel.language]}
                      className="md:hidden w-[137px]"
                      flagsOnMobile
                    />
                  </Fragment>
                ))}
              </div>
            </div>
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
                  logo={resourceImgUrl(community, 'logo.webp')}
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
