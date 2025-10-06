import type { JoinedTutorialLight } from '@blms/types';
import { cn, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { TbChevronRight } from 'react-icons/tb';
import { assetUrl } from '#src/utils/index.js';
import { formatNameForURL } from '#src/utils/string.ts';

export const TutorialCard = ({
  tutorial,
  addMargin,
}: {
  tutorial: JoinedTutorialLight;
  addMargin?: boolean;
}) => {
  return (
    <Link
      to={`/tutorials/${tutorial.category}/${tutorial.subcategory}/${formatNameForURL(tutorial.name)}-${tutorial.id}`}
      key={tutorial.id}
      className={cn(
        'w-full flex items-center justify-between p-2 hover:bg-neutral-50 rounded-2xl',
        addMargin && 'my-2',
      )}
    >
      <div className="flex gap-6 items-center">
        <Image
          src={assetUrl(tutorial.logoUrl, 'logo.webp', tutorial.lastCommit)}
          alt={tutorial.name}
          breakpoints={{ default: 96, md: 160 }}
          loading="lazy"
          className="object-cover [overflow-clip-margin:_unset] aspect-square rounded-lg md:rounded-2xl size-12 md:size-20 border-[0.5px] border-neutral-100"
        />
        <div className="flex flex-col gap-0.5">
          <span className="body-base-bold md:subtitle-base text-black">
            {tutorial.title}
          </span>
          <span className="body-base text-newBlack-3 max-md:hidden line-clamp-2">
            {tutorial.description}
          </span>
        </div>
      </div>
      <TbChevronRight className="text-neutral-300 shrink-0" size={20} />
    </Link>
  );
};
