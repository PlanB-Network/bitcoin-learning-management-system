import { Link } from '@tanstack/react-router';
import { MdThumbDown, MdThumbUp } from 'react-icons/md';

import type { JoinedTutorialLight } from '@blms/types';
import { TextTag, cn } from '@blms/ui';

import { Image } from '#src/components/image.tsx';
import { assetUrl } from '#src/utils/index.js';

export const TutorialCard = ({
  tutorial,
  href,
  dark = false,
  addMargin,
}: {
  tutorial: JoinedTutorialLight;
  href: string;
  dark?: boolean;
  addMargin?: boolean;
}) => {
  return (
    <Link
      to={href}
      rel="noreferrer"
      className={cn(
        'flex items-center w-full rounded-lg md:rounded-[20px] p-1.5 md:p-4 gap-2.5 md:gap-6 max-md:w-[290px] overflow-hidden',
        dark
          ? 'bg-maroon-10 text-white hover:shadow-sm-card-dark'
          : 'bg-newGray-6 text-newBlack-3 md:shadow-course-navigation shadow-course-navigation-sm md:border hover:shadow-sm-card-light',
        addMargin && 'my-2',
      )}
    >
      <Image
        breakpoints={{ default: 60, md: 80 }}
        src={assetUrl(tutorial.logoUrl, 'logo.webp', tutorial.lastCommit)}
        alt={tutorial.name}
        className="size-[60px] md:size-20 rounded-full shrink-0"
      />
      <div className="flex flex-col overflow-hidden w-full">
        <span
          className={cn(
            'max-md:mobile-subtitle1 capitalize text-xl font-semibold  md:mb-1 line-clamp-2',
            dark ? 'text-white' : 'text-darkOrange-5',
          )}
        >
          {tutorial.title}
        </span>
        <span
          className={cn(
            'text-xs font-light mb-2 max-md:hidden',
            dark ? 'text-maroon-4' : 'text-newBlack-3',
          )}
        >
          {tutorial.description}
        </span>
        <div className="md:hidden">
          <span className="flex gap-1 md:gap-3 items-center my-1">
            <span
              className={cn(
                'text-base md:label-large-20px',
                dark ? 'text-white' : 'text-black',
              )}
            >
              {tutorial.likeCount}
            </span>
            <span className="flex items-center">
              <MdThumbUp className="text-brightGreen-5 size-[18px] lg:size-[21px]" />
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
                        background: `linear-gradient(to right, #19C315 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%, #FF0000 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%)`,
                      }
                    : {}
                }
              />
              <div
                className={`h-[9px] mx-3 w-px md:hidden ${dark ? 'bg-white' : 'bg-black'}`}
              />
              <MdThumbDown className="text-red-5 size-[18px] lg:size-[21px]" />
            </span>
            <span
              className={`text-${dark ? 'white' : 'black'} text-base md:label-large-20px`}
            >
              {tutorial.dislikeCount}
            </span>
          </span>
        </div>
        <span className="flex gap-1.5 md:gap-4 w-full overflow-hidden">
          {tutorial.tags.map((tag) => (
            <TextTag
              key={tag}
              size="verySmall"
              variant={dark ? 'lightMaroon' : 'grey'}
              mode={dark ? 'dark' : 'light'}
              className="text-nowrap"
            >
              {tag}
            </TextTag>
          ))}
        </span>
      </div>
      <span className="flex flex-col max-md:hidden w-fit min-w-[187px] ml-auto h-full justify-between items-end">
        <span className="flex gap-1 md:gap-3 items-center my-1 mt-auto">
          <span
            className={`text-${dark ? 'white' : 'black'} text-base md:label-large-20px`}
          >
            {tutorial.likeCount}
          </span>
          <span className="flex items-center">
            <MdThumbUp className="text-brightGreen-5 size-[18px] lg:size-[21px]" />
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
                      background: `linear-gradient(to right, #19C315 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%, #ff0000 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%)`,
                    }
                  : {}
              }
            />

            <div
              className={`h-[9px] mx-3 w-px md:hidden ${dark ? 'bg-white' : 'bg-black'}`}
            />
            <MdThumbDown className="text-red-5 size-[18px] lg:size-[21px]" />
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
