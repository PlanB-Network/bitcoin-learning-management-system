import { t } from 'i18next';
import { MdThumbDown, MdThumbUp } from 'react-icons/md';

import type { JoinedTutorialLight } from '@blms/types';
import { cn } from '@blms/ui';

import ApprovedBadge from '#src/assets/tutorials/approved.svg?react';
import { computeAssetCdnUrl } from '#src/utils/index.js';

export const TutorialCard = ({
  tutorial,
  href,
}: {
  tutorial: JoinedTutorialLight;
  href: string;
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center w-full bg-newGray-6 shadow-course-navigation-sm md:shadow-course-navigation md:border border-newGray-5 rounded-lg md:rounded-[20px] p-1 md:p-4 gap-2.5 md:gap-6 max-md:max-w-72"
    >
      <img
        src={
          tutorial.builder
            ? computeAssetCdnUrl(
                tutorial.builder.lastCommit,
                `${tutorial.builder.path}/assets/logo.webp`,
              )
            : computeAssetCdnUrl(
                tutorial.lastCommit,
                `${tutorial.path}/assets/logo.webp`,
              )
        }
        alt={tutorial.name}
        className="size-[60px] md:size-20  rounded-full"
      />
      <div className="flex flex-col">
        <span className="max-md:mobile-subtitle1 capitalize text-xl font-semibold text-darkOrange-5 mb-1">
          {tutorial.name}
        </span>
        <p className="text-newBlack-3 text-xs font-light mb-2 max-md:hidden">
          {tutorial.description}
        </p>
        <div className="flex gap-2.5 md:gap-4 flex-wrap">
          {tutorial.tags.map((tag) => (
            <span
              key={tag}
              className="bg-[rgba(204,204,204,0.5)] px-1 py-px md:px-2 md:py-1 rounded-sm md:rounded-md desktop-typo1 text-newBlack-3 max-md:desktop-caption1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col max-md:hidden w-fit min-w-[187px] ml-auto h-full justify-between items-end">
        <p className="flex gap-2 text-xs italic font-poppins text-right text-newBlack-4">
          {t('tutorials.approvedByCreator')}{' '}
          <ApprovedBadge className="size-[18px]" />
        </p>
        <div className="flex gap-1 items-center">
          <span className="text-black label-large-20px">
            {tutorial.likeCount}
          </span>
          <div className="flex items-center">
            <MdThumbUp className="text-brightGreen-1 size-6 mx-1" />
            <div
              className={cn(
                'w-[70px] rounded-full h-2 mx-2',
                tutorial.likeCount === 0 &&
                  tutorial.dislikeCount === 0 &&
                  'bg-newGray-3',
              )}
              style={
                tutorial.likeCount > 0 || tutorial.dislikeCount > 0
                  ? {
                      background: `linear-gradient(to right, #19c315 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%, #e00000 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%)`,
                    }
                  : {}
              }
            />
            <MdThumbDown className="text-red-1 size-6 mx-1" />
          </div>
          <span className="text-black label-large-20px">
            {tutorial.dislikeCount}
          </span>
        </div>
      </div>
    </a>
  );
};
