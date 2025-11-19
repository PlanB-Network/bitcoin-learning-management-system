import type { JoinedTutorialLight } from '@blms/types';
import { cn } from '@blms/ui';
import { MdThumbDown, MdThumbUp } from 'react-icons/md';

import SeparatorIcon from '#src/assets/icons/separator-likes.svg';

export const TutorialLikes = ({
  tutorial,
  className,
}: {
  tutorial: JoinedTutorialLight;
  className?: string;
}) => {
  return (
    <span className={cn('flex gap-1 md:gap-3 items-center my-1', className)}>
      <span className="text-black text-base md:label-large-20px">
        {tutorial.likeCount}
      </span>
      <span className="flex items-center">
        <MdThumbUp className="text-green-400 size-[18px] lg:size-[21px]" />
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
                  background: `linear-gradient(to right, #19c315 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%, #ff0000 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%)`,
                }
              : {}
          }
        />

        <img
          src={SeparatorIcon}
          alt="separator icon"
          className="inline-block md:hidden mx-[18px] h-2.5"
        />
        <MdThumbDown className="text-red-5 size-[18px] lg:size-[21px]" />
      </span>
      <span className="text-black text-base md:label-large-20px">
        {tutorial.dislikeCount}
      </span>
    </span>
  );
};
