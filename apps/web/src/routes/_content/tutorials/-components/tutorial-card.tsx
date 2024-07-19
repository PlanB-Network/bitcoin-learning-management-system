import type { JoinedTutorialLight } from '@sovereign-university/types';

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
    </a>
  );
};
