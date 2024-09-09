import { MdThumbDown, MdThumbUp } from 'react-icons/md';

import type { JoinedTutorialLight } from '@blms/types';
import { cn } from '@blms/ui';

export const TutorialLikes = ({
  tutorial,
}: {
  tutorial: JoinedTutorialLight;
}) => {
  return (
    <span className="flex gap-1 items-center">
      <span className="text-black dark:text-white label-large-20px">
        {tutorial.likeCount}
      </span>
      <span className="flex items-center">
        <MdThumbUp className="text-brightGreen-5 size-6 mx-1" />
        <span
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
      </span>
      <span className="text-black dark:text-white label-large-20px">
        {tutorial.dislikeCount}
      </span>
    </span>
  );
};
