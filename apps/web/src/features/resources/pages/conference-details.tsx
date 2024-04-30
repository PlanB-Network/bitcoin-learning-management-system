import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useParams } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@sovereign-university/ui';

import { NewTag } from '#src/atoms/Tag/index.js';
import { ReactPlayer } from '#src/components/ReactPlayer/index.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.js';

import mockImg from '../../../assets/events/saif.webp';
import { trpc } from '../../../utils/index.ts';
import { DropdownMenu } from '../components/DropdownMenu/dropdown-menu.tsx';
import { ResourceLayout } from '../layout.tsx';
import { useTranslation } from 'react-i18next';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const Conference = () => {
  // TODO useState + useEffect to get videos and stages
  const [stages, setStages] = useState(['Name of stage 1', 'Name of stage 2']);
  const [activeStage, setActiveStage] = useState(0);

  const [videos, setVideos] = useState([
    [
      {
        name: 'Video 1 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker',
        description: 'Description 1',
      },
      {
        name: 'Video 2 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/rstDeS1IdSM?si=mbOi8tQkKJ9vbver',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 3 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 4 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 5 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 6 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 7 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 8 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 9 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 10 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 11 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 12 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 13 Stage 1 VERY LONG NAME',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 14 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 15 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
      {
        name: 'Video 16 Stage 1',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
    ],
    [
      {
        name: 'Video 1 Stage 2',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker',
        description: 'Description 1',
      },
      {
        name: 'Video 2 Stage 2',
        videoLink:
          'https://www.youtube.com/embed/nfDofHs_O5o?si=OZdOKretLZXNIHs2',
        speaker: 'Speaker 2',
        description: 'Description 2',
      },
    ],
  ]);
  const [activeVideo, setActiveVideo] = useState(0);
  const [videoInfos, setVideoInfos] = useState(
    videos[activeStage][activeVideo],
  );

  useEffect(() => {
    setVideoInfos(videos[activeStage][activeVideo]);
  }, [activeStage, activeVideo, videos]);

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

  useEffect(() => {
    if (!conference && isFetched && !navigateTo404Called.current) {
      navigateTo404();
      navigateTo404Called.current = true;
    }
  }, [conference, isFetched, navigateTo404]);

  const isScreenSm = useGreater('sm');

  return (
    <ResourceLayout
      title={t('conferences.pageTitle')}
      tagLine={t('conferences.pageSubtitle')}
      activeCategory="conferences"
      maxWidth="1360"
      className="max-md:mx-4"
    >
      {/* Top part */}
      <div className="flex flex-col lg:flex-row justify-center items-center w-full gap-4 lg:gap-8">
        <img
          src={mockImg}
          alt="Conference"
          className="lg:order-2 w-full object-cover aspect-[915/388] rounded-2xl"
        />
        <div className="lg:w-full lg:max-w-[560px] lg:order-1 text-white w-full">
          <h2 className="text-white mobile-h2 sm:text-[40px] sm:leading-tight sm:tracking-[0.25px]">
            Adopting Bitcoin 2018
          </h2>
          <span className="text-newGray-4 mobile-body2 sm:desktop-h8">
            City, Country, Month
          </span>
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-8">
            <NewTag>General</NewTag>
            <NewTag>Lightning Network</NewTag>
            <NewTag>Lightning Network</NewTag>
            <NewTag>Humanitarian</NewTag>
          </div>
          <p className="max-lg:hidden sm:desktop-body1 text-newGray-1 mt-8">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officia,
            unde cumque esse facere id quas consequuntur iste ea accusantium
            saepe tempora quae quidem quis fuga eaque minus et doloribus
            adipisci?
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
            {stages.map((stage, index) => {
              return index === activeStage ? (
                <Button key={index} variant="newPrimary" size="l">
                  {stage}
                </Button>
              ) : (
                <button
                  key={index}
                  className="p-4 text-newGray-1 text-lg leading-normal font-medium"
                  onClick={() => {
                    setActiveVideo(0);
                    setActiveStage(index);
                  }}
                >
                  {stage}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <span className="desktop-h7 text-white">
            {t('conferences.details.selectVideo')}
          </span>
          <div className="flex flex-wrap gap-4 px-2.5 pb-5 max-h-[228px] overflow-auto no-scrollbar">
            {videos[activeStage].map((video, index) => {
              return index === activeVideo ? (
                <Button key={video.name} variant="newPrimary" size="l">
                  {video.name}
                </Button>
              ) : (
                <Button
                  key={video.name}
                  variant="newPrimary"
                  fakeDisabled
                  size="l"
                  onClick={() => setActiveVideo(index)}
                >
                  {video.name}
                </Button>
              );
            })}
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
          activeItem={stages[activeStage]}
          itemsList={stages.map((stage, index) => {
            return { name: stage, onClick: () => setActiveStage(index) };
          })}
        />
        <DropdownMenu
          activeItem={videos[activeStage][activeVideo].name}
          itemsList={videos[activeStage].map((video, index) => {
            return { name: video.name, onClick: () => setActiveVideo(index) };
          })}
        />
      </div>

      {/* Video */}
      <div className="flex flex-col mt-6 w-full">
        <h3 className="text-[40px] text-white leading-tight tracking-[0.25px] mb-6 max-md:hidden">
          {videoInfos.name}
        </h3>
        <h3 className="mobile-subtitle1 text-white mb-2.5 md:hidden">
          {t('conferences.details.watchReplay')}
        </h3>
        <div className="aspect-video">
          <ReactPlayer
            url={videoInfos.videoLink}
            controls
            width={'100%'}
            height={'100%'}
          />
        </div>
        {(videoInfos.speaker || videoInfos.description) && (
          <div className="flex flex-col desktop-subtitle1 text-newGray-1 mt-2.5 md:mt-10 gap-0.5 md:gap-10">
            {videoInfos.speaker && (
              <span>
                {t('conferences.details.speaker')} : {videoInfos.speaker}
              </span>
            )}
            {videoInfos.description && <p>{videoInfos.description}</p>}
          </div>
        )}
      </div>

      <div className="flex w-full mt-4 md:mt-11">
        {activeVideo > 0 && (
          <Button
            variant="newSecondary"
            size={isScreenSm ? 'l' : 's'}
            className="mr-auto"
            onHoverArrow="left"
            onClick={() => setActiveVideo((v) => v - 1)}
          >
            {t('conferences.details.previousVideo')}
          </Button>
        )}

        {activeVideo < videos[activeStage].length - 1 && (
          <Button
            variant="newSecondary"
            size={isScreenSm ? 'l' : 's'}
            className="ml-auto"
            onClick={() => setActiveVideo((v) => v + 1)}
          >
            {t('conferences.details.nextVideo')}
          </Button>
        )}
      </div>
    </ResourceLayout>
  );
};
