import type { JoinedTutorialLight } from '@blms/types';
import { cn } from '@blms/ui';
import { TbThumbDown, TbThumbUp } from 'react-icons/tb';

export const TutorialLikes = ({
  tutorial,
  className,
  isMobile,
}: {
  tutorial: JoinedTutorialLight;
  className?: string;
  isMobile?: boolean;
}) => {
  return (
    <span className={cn('flex gap-1 md:gap-3 items-center', className)}>
      <span className="text-green-400 body-small md:body-base-bold">
        {tutorial.likeCount}
      </span>
      <span className="flex items-center">
        <TbThumbUp size={isMobile ? 16 : 24} className="text-green-400" />
        <span
          className={cn(
            'w-[37px] md:w-[70px] rounded-full h-2 mx-2',
            tutorial.likeCount === 0 &&
              tutorial.dislikeCount === 0 &&
              'bg-neutral-100',
          )}
          style={
            tutorial.likeCount > 0 || tutorial.dislikeCount > 0
              ? {
                  background: `linear-gradient(to right, #19c315 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%, #E5E5E5 ${(tutorial.likeCount / (tutorial.likeCount + tutorial.dislikeCount)) * 100}%)`,
                }
              : {}
          }
        />

        <TbThumbDown size={isMobile ? 16 : 24} className="text-neutral-300" />
      </span>
      <span className="text-neutral-300 body-small md:body-base-bold">
        {tutorial.dislikeCount}
      </span>
    </span>
  );
};
