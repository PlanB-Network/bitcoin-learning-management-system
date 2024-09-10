// import { t } from 'i18next';

import { Link } from '@tanstack/react-router';
import { MdThumbDown, MdThumbUp } from 'react-icons/md';

import type { JoinedTutorialLight } from '@blms/types';
// import ApprovedBadge from '#src/assets/tutorials/approved.svg?react';
import { cn } from '@blms/ui';

import { computeAssetCdnUrl } from '#src/utils/index.js';

export const TutorialCard = ({
  tutorial,
  href,
  dark = false,
}: {
  tutorial: JoinedTutorialLight;
  href: string;
  dark?: boolean;
}) => {
  return (
    <Link
      to={href}
      rel="noreferrer"
      className={cn(
        'flex items-center w-full rounded-lg md:rounded-[20px] p-1.5 md:p-4 gap-2.5 md:gap-6 max-md:w-[290px]',
        dark
          ? 'bg-darkOrange-10 text-white'
          : 'bg-newGray-6 text-newBlack-3 md:shadow-course-navigation shadow-course-navigation-sm md:border',
      )}
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
      <span className="flex flex-col">
        <span className="max-md:mobile-subtitle1 capitalize text-xl font-semibold text-darkOrange-5 md:mb-1">
          {tutorial.title}
        </span>
        <span
          className={cn(
            'text-xs font-light mb-2 max-md:hidden',
            dark ? 'text-white' : 'text-newBlack-3',
          )}
        >
          {tutorial.description}
        </span>
        <div className="md:hidden">
          <span className="flex gap-1 md:gap-3 items-center my-1">
            <span
              className={`text-${dark ? 'white' : 'black'} text-base md:label-large-20px`}
            >
              {tutorial.likeCount}
            </span>
            <span className="flex items-center">
              <MdThumbUp className="text-darkGreen-1 size-[18px] lg:size-[21px]" />
              <span
                className={cn(
                  'w-[70px] rounded-full h-2 mx-2 max-md:hidden',
                  tutorial.likeCount === 0 &&
                    tutorial.dislikeCount === 0 &&
                    'bg-newGray-3',
                )}
                style={
                  tutorial.likeCount > 0 || tutorial.dislikeCount > 0
                    ? {
                        background: `linear-gradient(to right, #42a86b ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%, #e00000 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%)`,
                      }
                    : {}
                }
              />
              <div
                className={`h-[9px] mx-3 w-px md:hidden ${dark ? 'bg-white' : 'bg-black'}`}
              ></div>
              <MdThumbDown className="text-red-1 size-[18px] lg:size-[21px]" />
            </span>
            <span
              className={`text-${dark ? 'white' : 'black'} text-base md:label-large-20px`}
            >
              {tutorial.dislikeCount}
            </span>
          </span>
        </div>
        <span className="flex gap-2.5 md:gap-4 flex-wrap">
          {tutorial.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                'px-1 py-px md:px-2 md:py-1 rounded-sm md:rounded-md desktop-typo1 max-md:desktop-caption1',
                dark
                  ? 'bg-darkOrange-7 text-white'
                  : 'bg-[rgba(204,204,204,0.5)] text-newBlack-3',
              )}
            >
              {tag}
            </span>
          ))}
        </span>
      </span>
      <span className="flex flex-col max-md:hidden w-fit min-w-[187px] ml-auto h-full justify-between items-end">
        <span className="flex items-center gap-2 text-xs italic font-poppins text-right text-newBlack-4">
          {/* {t('tutorials.approvedByCreator')}
          <ApprovedBadge className="size-[18px]" /> */}
        </span>
        <span className="flex gap-1 md:gap-3 items-center my-1">
          <span
            className={`text-${dark ? 'white' : 'black'} text-base md:label-large-20px`}
          >
            {tutorial.likeCount}
          </span>
          <span className="flex items-center">
            <MdThumbUp className="text-darkGreen-1 size-[18px] lg:size-[21px]" />
            <span
              className={cn(
                'w-[70px] rounded-full h-2 mx-2 max-md:hidden',
                tutorial.likeCount === 0 &&
                  tutorial.dislikeCount === 0 &&
                  'bg-newGray-3',
              )}
              style={
                tutorial.likeCount > 0 || tutorial.dislikeCount > 0
                  ? {
                      background: `linear-gradient(to right, #42a86b ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%, #e00000 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%)`,
                    }
                  : {}
              }
            />

            <div
              className={`h-[9px] mx-3 w-px md:hidden ${dark ? 'bg-white' : 'bg-black'}`}
            ></div>
            <MdThumbDown className="text-red-1 size-[18px] lg:size-[21px]" />
          </span>
          <span
            className={`text-${dark ? 'white' : 'black'} text-base md:label-large-20px`}
          >
            {tutorial.dislikeCount}
          </span>
        </span>
      </span>
    </Link>
  );
};
