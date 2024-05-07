import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ConferenceStageVideo } from '@sovereign-university/types';
import { Button } from '@sovereign-university/ui';

import { NewTag } from '#src/atoms/Tag/index.js';
import { ConferencesMarkdownBody } from '#src/components/ConferencesMarkdownBody/index.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.js';

import { trpc } from '../../../utils/index.ts';
import { DropdownMenu } from '../components/DropdownMenu/dropdown-menu.tsx';
import { ResourceLayout } from '../layout.tsx';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

const MarkdownContent = ({ rawContent }: { rawContent: string }) => {
  return rawContent.includes('\n') ? (
    rawContent
      .replaceAll('[live replay]', '![video]')
      .split('\n')
      .map((content, index) => (
        <ConferencesMarkdownBody key={index} content={content} />
      ))
  ) : (
    <ConferencesMarkdownBody content={rawContent} />
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

export const Conference = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);

  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const { conferenceId } = useParams({
    from: '/resources/conference/$conferenceId',
  });
  const navigateTo404Called = useRef(false);

  const { data: conference, isFetched } = trpc.content.getConference.useQuery({
    id: Number(conferenceId),
    language: i18n.language ?? 'en',
  });

  const isScreenSm = useGreater('sm');

  useEffect(() => {
    if (!conference && isFetched && !navigateTo404Called.current) {
      navigateTo404();
      navigateTo404Called.current = true;
    }
  }, [conference, isFetched, navigateTo404]);

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

  if (!conference) {
    return;
  }

  return (
    <ResourceLayout
      title={t('conferences.pageTitle')}
      tagLine={t('conferences.pageSubtitle')}
      activeCategory="conferences"
      showPageHeader={false}
      maxWidth="1360"
      className="max-md:mx-4"
    >
      {conference && (
        <>
          {/* Top part */}
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
              <div className="flex flex-wrap gap-4 mt-4 lg:mt-8">
                {conference.tags.map((tag) => (
                  <NewTag key={tag} className="capitalize">
                    {tag}
                  </NewTag>
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
                      variant="newPrimary"
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
              <div className="flex flex-wrap gap-4 px-2.5 pb-5 max-h-[228px] overflow-auto scrollbar-thin scroll-smooth">
                {sortVideos(conference.stages[activeStage].videos).map(
                  (video, index) => {
                    const videoName =
                      video.name.length > 50
                        ? video.name.slice(0, 47).trim() + '...'
                        : video.name;

                    return index === activeVideo ? (
                      <Button
                        key={`${video.name}_${index}`}
                        variant="newPrimary"
                        size="l"
                        className="capitalize"
                      >
                        {video.name}
                      </Button>
                    ) : (
                      <Button
                        key={`${video.name}_${index}`}
                        variant="newPrimary"
                        fakeDisabled
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
                  onClick: () => setActiveStage(index),
                };
              })}
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
              {activeVideo > 0 && (
                <Button
                  variant="newSecondary"
                  size={isScreenSm ? 'l' : 's'}
                  onHoverArrow
                  onHoverArrowDirection="left"
                  className="mr-auto"
                  onClick={() => setActiveVideo((v) => v - 1)}
                >
                  {t('conferences.details.previousVideo')}
                </Button>
              )}

              {activeVideo <
                conference.stages[activeStage].videos.length - 1 && (
                <Button
                  variant="newSecondary"
                  size={isScreenSm ? 'l' : 's'}
                  onHoverArrow
                  className="ml-auto"
                  onClick={() => setActiveVideo((v) => v + 1)}
                >
                  {t('conferences.details.nextVideo')}
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-center md:justify-start">
            <Link to="/resources/conferences">
              <Button
                variant="newPrimary"
                onHoverArrow
                onHoverArrowDirection="left"
                className="mt-10"
              >
                {t('conferences.backConferences')}
              </Button>
            </Link>
          </div>
        </>
      )}
    </ResourceLayout>
  );
};
