import { MdThumbDown, MdThumbUp } from 'react-icons/md';

import type { JoinedTutorialLight } from '@blms/types';
import { cn } from '@blms/ui';

import SeparatorIcon from '../../../../assets/icons/separator-likes.svg';

export const TutorialLikes = ({
  tutorial,
}: {
  tutorial: JoinedTutorialLight;
}) => {
  return (
    <span className="flex gap-1 items-center my-1">
      <span className="text-black label-large-20px">{tutorial.likeCount}</span>
      <span className="flex items-center">
        <MdThumbUp className="text-darkGreen-1 size-7 mx-1" />
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

        <img
          src={SeparatorIcon}
          alt="separator icon"
          className="inline-block md:hidden mx-3 h-[10px]"
        />
        <MdThumbDown className="text-red-1 size-7 mx-1" />
      </span>
      <span className="text-black label-large-20px">
        {tutorial.dislikeCount}
      </span>
    </span>
  );
};
