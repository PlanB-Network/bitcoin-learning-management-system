import { Link, createFileRoute } from '@tanstack/react-router';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsLink, BsTwitterX } from 'react-icons/bs';
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6';
import { GrLinkNext, GrLinkPrevious } from 'react-icons/gr';
import { z } from 'zod';

import type { ConferenceStageVideo } from '@blms/types';
import { Button, Loader, Tag, cn } from '@blms/ui';

import { DropdownMenu } from '#src/components/Dropdown/dropdown-menu.tsx';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { BackLink } from '#src/molecules/backlink.tsx';
import { trpc } from '#src/utils/trpc.js';

import { ResourceLayout } from '../-components/resource-layout.tsx';
// eslint-disable-next-line import/no-named-as-default-member
const ConferencesMarkdownBody = React.lazy(
  () => import('#src/components/Markdown/conference-markdown-body.js'),
);

export const Route = createFileRoute(
  '/_content/resources/conferences/$conferenceId',
)({
  params: {
    parse: (params) => ({
      conferenceId: z.number().int().parse(Number(params.conferenceId)),
    }),
    stringify: ({ conferenceId }) => ({ conferenceId: `${conferenceId}` }),
  },
  component: Conference,
});

const MarkdownContent = ({ rawContent }: { rawContent: string }) => {
  return rawContent.includes('\n') ? (
    rawContent
      .replaceAll('[live replay]', '![video]')
      .split('\n')
      .map((content, index) => (
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

  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: conference, isFetched } = trpc.content.getConference.useQuery({
    id: params.conferenceId,
    language: i18n.language ?? 'en',
  });

  const { data: proofreading } = trpc.content.getProofreading.useQuery({
    language: i18n.language,
    resourceId: params.conferenceId,
  });

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

  return (
    <ResourceLayout
      title={t('conferences.pageTitle')}
      tagLine={t('conferences.pageSubtitle')}
      activeCategory="conferences"
      showPageHeader={false}
      backToCategoryButton={true}
      maxWidth="1360"
      className="max-md:mx-4"
      showResourcesDropdownMenu={false}
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !conference && (
        <div className="w-[768px] mx-auto text-white">
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.conference'),
          })}
        </div>
      )}
      {conference && (
        <>
          {proofreading ? (
            <ProofreadingProgress
              mode="dark"
              proofreadingData={{
                contributors: proofreading.contributorsId,
                reward: proofreading.reward,
              }}
            />
          ) : (
            <></>
          )}

          {/* Top part */}
          <BackLink
            to={'/resources/conferences'}
            label={t('conferences.pageTitle')}
          />

          <div className="flex flex-col lg:flex-row justify-center items-center w-full gap-4 lg:gap-8">
            <div className="lg:order-2 w-full max-w-full">
              <img
                src={conference.thumbnail}
                alt={conference.name}
                className="w-full object-cover aspect-[915/388] rounded-2xl"
              />
            </div>
            <div className="lg:max-w-[560px] lg:order-1 text-white w-full">
              <h2 className="text-white mobile-h2 sm:text-[40px] sm:leading-tight sm:tracking-[0.25px]">
                {conference.name}
              </h2>
              <span className="text-newGray-4 mobile-body2 sm:desktop-h8">
                {conference.location}, {conference.year}
              </span>
              {(conference.twitterUrl || conference.websiteUrl) && (
                <>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    {conference.twitterUrl && (
                      <a
                        href={conference.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BsTwitterX className="size-4 md:size-6" />
                      </a>
                    )}
                    {conference.websiteUrl && (
                      <a
                        href={conference.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BsLink className="size-4 md:size-6" />
                      </a>
                    )}
                  </div>
                </>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {conference.tags.map((tag) => (
                  <Tag key={tag} className="capitalize">
                    {tag}
                  </Tag>
                ))}
              </div>
              <p className="max-lg:hidden sm:desktop-body1 text-newGray-1 mt-8">
                {conference.description}
              </p>
            </div>
          </div>

          <div className="h-px bg-newBlack-5 lg:bg-white/25 my-8 max-md:hidden" />

          {/* Stage and Video Selectors */}
          {/* Desktop */}
          <div className="flex flex-col gap-11 max-md:hidden">
            <div className="flex flex-col gap-5">
              <span className="desktop-h7 text-white">
                {t('conferences.details.selectStage')}
              </span>
              <div className="flex flex-wrap p-2 gap-4 bg-newBlack-2 rounded-[20px] w-fit">
                {conference.stages.map((stage, index) => {
                  return index === activeStage ? (
                    <Button
                      key={`${stage.name}_${index}`}
                      variant="primary"
                      size="l"
                      className="capitalize"
                    >
                      {stage.name}
                    </Button>
                  ) : (
                    <button
                      key={`${stage.name}_${index}`}
                      className="p-4 text-newGray-1 text-lg leading-normal font-medium capitalize"
                      onClick={() => {
                        setActiveVideo(0);
                        setActiveStage(index);
                      }}
                    >
                      {stage.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <span className="desktop-h7 text-white">
                {t('conferences.details.selectVideo')}
              </span>
              <div className="flex flex-wrap gap-4 px-2.5 pb-5 max-h-[228px] overflow-auto scrollbar-dark scroll-smooth">
                {sortVideos(conference.stages[activeStage].videos).map(
                  (video, index) => {
                    const videoName =
                      video.name.length > 50
                        ? video.name.slice(0, 47).trim() + '...'
                        : video.name;

                    return index === activeVideo ? (
                      <Button
                        key={`${video.name}_${index}`}
                        variant="primary"
                        size="l"
                        className="capitalize"
                      >
                        {video.name}
                      </Button>
                    ) : (
                      <Button
                        key={`${video.name}_${index}`}
                        variant="outline"
                        size="l"
                        onClick={() => setActiveVideo(index)}
                        className="capitalize"
                      >
                        {videoName}
                      </Button>
                    );
                  },
                )}
              </div>
            </div>
          </div>

          {/* Stage and Video Selectors */}
          {/* Mobile */}
          <div className="flex flex-col gap-4 md:hidden mt-6 mb-9">
            <h3 className="mobile-subtitle1 text-white mb-2.5">
              {t('conferences.details.findReplay')}
            </h3>
            <DropdownMenu
              activeItem={conference.stages[activeStage].name}
              itemsList={conference.stages.map((stage, index) => {
                return {
                  name: stage.name,
                  onClick: () => {
                    setActiveVideo(0), setActiveStage(index);
                  },
                };
              })}
              className="lg:hidden"
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
              className="lg:hidden"
            />
          </div>

          {/* Video */}
          <div
            onKeyDown={(event) => handleKeyDownVideo(event)}
            tabIndex={-1}
            role="presentation"
            className="outline-none"
          >
            <div className="flex flex-col mt-6 w-full">
              <h3 className="text-[40px] text-white leading-tight tracking-[0.25px] mb-6 max-md:hidden">
                {conference.stages[activeStage].videos[activeVideo].name}
              </h3>
              <h3 className="mobile-subtitle1 text-white mb-2.5 md:hidden">
                {t('conferences.details.watchReplay')}
              </h3>
              <div className="flex flex-col gap-3">
                <MarkdownContent
                  rawContent={
                    conference.stages[activeStage].videos[activeVideo]
                      .rawContent
                  }
                />
              </div>
            </div>

            <div className="flex w-full mt-4 md:mt-11">
              {/* Desktop */}
              {activeVideo > 0 && (
                <Button
                  variant="secondary"
                  size="l"
                  className="mr-auto max-sm:hidden"
                  onClick={() => setActiveVideo((v) => v - 1)}
                >
                  <FaArrowLeftLong
                    className={cn(
                      'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                      'group-hover:mr-3',
                    )}
                  />
                  {t('conferences.details.previousVideo')}
                </Button>
              )}

              {activeVideo <
                conference.stages[activeStage].videos.length - 1 && (
                <Button
                  variant="secondary"
                  size="l"
                  className="ml-auto max-sm:hidden"
                  onClick={() => setActiveVideo((v) => v + 1)}
                >
                  {t('conferences.details.nextVideo')}
                  <FaArrowRightLong
                    className={cn(
                      'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                      'group-hover:ml-3',
                    )}
                  />
                </Button>
              )}

              {/* Mobile */}
              {activeVideo > 0 && (
                <Button
                  variant="secondary"
                  size="s"
                  className="mr-auto sm:hidden"
                  onClick={() => setActiveVideo((v) => v - 1)}
                >
                  <span className="flex gap-2 justify-center items-center">
                    <GrLinkPrevious size={16} /> Previous
                  </span>
                </Button>
              )}

              {activeVideo <
                conference.stages[activeStage].videos.length - 1 && (
                <Button
                  variant="secondary"
                  size="s"
                  className="ml-auto sm:hidden"
                  onClick={() => setActiveVideo((v) => v + 1)}
                >
                  <span className="flex gap-2 justify-center items-center">
                    Next <GrLinkNext size={16} />
                  </span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Link to="/resources/conferences">
              <Button variant="outlineWhite" className="mt-10">
                {t('conferences.backConferences')}
              </Button>
            </Link>
          </div>
        </>
      )}
    </ResourceLayout>
  );
}
