import type { ConferenceStageVideo } from '@blms/types';
import { CategorySwitcher, DropdownMenu, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbBrandX, TbLink } from 'react-icons/tb';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.js';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { resourceImgUrl, trpc } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.js';
import { ResourceDetails } from '../-components/resource-details.tsx';

const ConferencesMarkdownBody = React.lazy(
  () => import('#src/components/Markdown/conference-markdown-body.js'),
);

export const Route = createFileRoute(
  '/$lang/_content/resources/conferences/$conferenceName-$conferenceId',
)({
  component: Conference,
  params: {
    parse: (params) => {
      const conferenceNameId = params['conferenceName-$conferenceId'];
      const { id, name } = getNameAndIdFromUrl(conferenceNameId);

      return {
        conferenceId: z.string().parse(id),
        conferenceName: z.string().parse(name),
        'conferenceName-$conferenceId': `${name}-${id}`,
        lang: z.string().parse(params.lang),
      };
    },
    stringify: ({ lang, conferenceName, conferenceId }) => ({
      'conferenceName-$conferenceId': `${conferenceName}-${conferenceId}`,
      lang: lang,
    }),
  },
});

const MarkdownContent = ({ rawContent }: { rawContent: string }) => {
  return rawContent.includes('\n') ? (
    rawContent
      .replaceAll('[live replay]', '![video]')
      .split('\n')
      .map((content, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: explanation
        <Suspense key={index} fallback={<Loader size={'s'} />}>
          <ConferencesMarkdownBody content={content} />
        </Suspense>
      ))
  ) : (
    <Suspense fallback={<Loader size={'s'} />}>
      <ConferencesMarkdownBody content={rawContent} />
    </Suspense>
  );
};

const sortVideos = (videos: ConferenceStageVideo[]) => {
  return videos.sort((a, b) => {
    return getVideoIdNumber(a) - getVideoIdNumber(b);
  });
};

function getVideoIdNumber(video: ConferenceStageVideo) {
  const parts = video.videoId.split('_');
  const idPart = parts.at(-1);
  const idNumber = Number(idPart);

  return Number.isNaN(idNumber) ? 0 : idNumber;
}

function Conference() {
  const [activeStage, setActiveStage] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: conference, isFetched } = useQuery(
    trpc.content.getConference.queryOptions({
      id: params.conferenceId,
      language: i18n.language ?? 'en',
    }),
  );

  const { data: proofreading } = useQuery(
    trpc.content.getProofreading.queryOptions({
      language: i18n.language,
      resourceId: params.conferenceId,
    }),
  );

  // Get stage and video from URL
  useEffect(() => {
    if (!isFetched || !conference?.stages?.length) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const stageId = urlParams.get('stage');
    const videoId = urlParams.get('video');

    if (!videoId || !stageId) {
      return;
    }

    const stageIndex = conference.stages.findIndex(
      (s) => s.stageId === stageId,
    );

    if (stageIndex !== -1) {
      const videoIndex = conference.stages[stageIndex].videos.findIndex(
        (v) => v.videoId === videoId,
      );

      if (videoIndex !== -1) {
        setActiveStage(stageIndex);
        setActiveVideo(videoIndex);

        // Scroll to video player
        document
          .getElementById('video')
          ?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [isFetched, conference]);

  const handleKeyDownVideo = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ): void => {
    if (conference && activeVideo > 0 && event.key === 'ArrowLeft') {
      setActiveVideo((v) => v - 1);
    }

    if (
      conference &&
      activeVideo < conference.stages[activeStage].videos.length - 1 &&
      event.key === 'ArrowRight'
    ) {
      setActiveVideo((v) => v + 1);
    }
  };

  useEffect(() => {
    if (
      conference &&
      params.conferenceName !== formatNameForURL(conference.name)
    ) {
      navigate({
        replace: true,
        to: `/resources/conferences/${formatNameForURL(conference.name)}-${conference.id}${location.hash}${location.search}`,
      });
    }
  }, [conference, isFetched, navigateTo404, navigate, params.conferenceName]);

  return (
    <PageLayout
      backLink={{
        href: '/resources/conferences',
        text: t('conferences.pageTitle'),
      }}
      layoutSize="base"
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !conference && (
        <div>
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.conference'),
          })}
        </div>
      )}
      {conference && (
        <>
          {proofreading ? (
            <ProofreadingProgress
              mode="light"
              proofreadingData={{
                contributors: proofreading.contributorNames,
                reward: proofreading.reward,
              }}
              isOriginalLanguage={false}
            />
          ) : (
            <></>
          )}

          <ResourceDetails
            title={conference.name}
            imgSrc={resourceImgUrl(conference)}
            subtitle={`${conference.location} · ${conference.year}`}
            mediaLinks={[
              ...(conference.websiteUrl
                ? [
                    {
                      icon: TbLink,
                      href: conference.websiteUrl,
                    },
                  ]
                : []),
              ...(conference.twitterUrl
                ? [
                    {
                      icon: TbBrandX,
                      href: conference.twitterUrl,
                    },
                  ]
                : []),
            ]}
            tags={conference.tags}
          />

          <p className="whitespace-pre-line body-base text-justify max-md:hidden mt-6">
            {conference.description}
          </p>

          {/* Stage and Video Selectors */}
          {/* Desktop */}
          <div className="flex flex-col gap-10 max-md:hidden mt-10">
            <div className="flex flex-col gap-2">
              <span className="label-strong">
                {t('conferences.details.selectStage')}
              </span>
              <div className="flex items-center flex-wrap gap-2">
                {conference.stages.map((stage, index) => {
                  return (
                    <CategorySwitcher
                      onClick={
                        index !== activeStage
                          ? () => {
                              setActiveVideo(0);
                              setActiveStage(index);
                            }
                          : () => {}
                      }
                      text={stage.name}
                      isActive={index === activeStage}
                      key={`${stage.name}`}
                      inactiveBackgroundColor="bg-neutral-50"
                    />
                  );
                })}
              </div>
            </div>
            <div id="video" className="flex flex-col gap-2">
              <span className="label-strong">
                {t('conferences.details.selectVideo')}
              </span>
              <div className="flex items-center flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-light">
                {sortVideos(conference.stages[activeStage].videos).map(
                  (video, index) => {
                    return (
                      <CategorySwitcher
                        onClick={
                          index !== activeVideo
                            ? () => {
                                setActiveVideo(index);
                              }
                            : () => {}
                        }
                        text={video.name}
                        isActive={index === activeVideo}
                        key={`${video.name}`}
                        inactiveBackgroundColor="bg-neutral-50"
                      />
                    );
                  },
                )}
              </div>
            </div>
          </div>

          {/* Stage and Video Selectors */}
          {/* Mobile */}
          <div className="flex flex-col gap-2 md:hidden mt-8">
            <h3 className="body-small-bold">
              {t('conferences.details.findReplay')}
            </h3>
            <DropdownMenu
              activeItem={conference.stages[activeStage].name}
              itemsList={conference.stages.map((stage, index) => {
                return {
                  name: stage.name,
                  onClick: () => {
                    setActiveVideo(0);
                    setActiveStage(index);
                  },
                };
              })}
              variant="light"
            />
            <DropdownMenu
              activeItem={
                conference.stages[activeStage].videos[activeVideo].name
              }
              itemsList={sortVideos(conference.stages[activeStage].videos).map(
                (video, index) => {
                  return {
                    name: video.name,
                    onClick: () => setActiveVideo(index),
                  };
                },
              )}
              variant="light"
            />
          </div>

          {/* Video */}
          <div
            onKeyDown={(event) => handleKeyDownVideo(event)}
            tabIndex={-1}
            role="presentation"
            className="outline-hidden mt-8 md:mt-10"
          >
            <div className="flex flex-col w-full">
              <h3 className="title-large max-md:hidden">
                {conference.stages[activeStage].videos[activeVideo].name}
              </h3>
              <div className="flex flex-col">
                <MarkdownContent
                  rawContent={
                    conference.stages[activeStage].videos[activeVideo]
                      .rawContent
                  }
                />
              </div>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}
