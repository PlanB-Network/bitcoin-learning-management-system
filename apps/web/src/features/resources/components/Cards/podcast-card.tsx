import { Link } from '@tanstack/react-router';

import type { JoinedPodcast } from '@sovereign-university/types';

interface PodCastCardProps {
  podcast: JoinedPodcast;
}

export const PodcastCard = ({ podcast }: PodCastCardProps) => {
  return (
    <Link
      to={'/resources/podcast/$podcastId'}
      params={{
        podcastId: podcast.id.toString(),
      }}
    >
      <div className="group flex flex-col gap-4 p-3 hover:bg-newOrange-1 rounded-2xl hover:z-10 hover:scale-110 transition-all duration-300">
        <img
          className="aspect-square object-contain group-hover:rounded-2xl transition-all duration-300"
          src={podcast.logo}
          alt={podcast.name}
        />
        <span className="text-white text-xl leading-5 font-medium">
          {podcast.name}
        </span>
        <span className="text-white leading-6">{podcast.host}</span>
      </div>
    </Link>
  );
};
