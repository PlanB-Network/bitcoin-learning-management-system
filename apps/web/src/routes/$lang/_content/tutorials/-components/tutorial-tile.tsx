import { Link } from '@tanstack/react-router';

import type { JoinedTutorialLight } from '@blms/types';

import { assetUrl } from '#src/utils/index.ts';

export const TutorialTile = ({
  tutorial,
}: {
  tutorial: JoinedTutorialLight;
}) => {
  return (
    <div
      key={tutorial.id}
      className="flex flex-col gap-2 items-center justify-center w-20 lg:w-24 h-full"
    >
      <Link
        to={`/tutorials/$category/$subcategory/${tutorial.name}-${tutorial.id}`}
        params={{
          category: tutorial.category,
          subcategory: tutorial.subcategory,
        }}
        className="group/project relative flex flex-col items-center justify-center"
      >
        <img
          className="size-12 sm:size-14 md:size-16 lg:size-20 rounded-full group-hover/project:blur-xs group-focus/project:blur-xs group-focus/project:brightness-[30%] transition-all bg-white/20"
          src={assetUrl(tutorial.logoUrl, 'logo.webp', tutorial.lastCommit)}
          alt={tutorial.title}
        />
        <p className="absolute flex justify-center items-center size-full p-1 rounded-full text-center text-xs font-bold text-white group-hover/project:bg-black/60 opacity-0 group-hover/project:opacity-100 group-focus/project:opacity-100 transition-all">
          {tutorial.title.slice(0, 18)}
        </p>
      </Link>
      <Link
        to={`/tutorials/$category/$subcategory/${tutorial.name}-${tutorial.id}`}
        params={{
          category: tutorial.category,
          subcategory: tutorial.subcategory,
        }}
        key={tutorial.id}
        className="text-xs font-bold text-white max-md:hidden text-center line-clamp-2"
      >
        {tutorial.title}
      </Link>
    </div>
  );
};
