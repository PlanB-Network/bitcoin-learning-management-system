import { Link } from '@tanstack/react-router';

// TODO : Add logo to JoinedPodcast type and switch it with PodcastType

interface PodcastType {
  id: number;
  path: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  lastUpdated: Date;
  lastCommit: string;
  tags: string[];
  host: string;
  language: string;
  twitterUrl: string | null;
  nostr: string | null;
  podcastUrl: string | null;
  logo: string | null;
}

interface PodCastCardProps {
  podcast: PodcastType;
}

export const PodcastCard = ({ podcast }: PodCastCardProps) => {
  return (
    <Link
      to={'/resources/podcast/$podcastId'}
      params={{
        podcastId: podcast.id.toString(),
      }}
      className="w-[288px]  md:max-w-64"
    >
      <div className="group flex md:flex-col gap-4 p-3 bg-newBlack-2 md:bg-transparent md:hover:bg-newOrange-1 rounded-2xl md:hover:z-10 md:hover:scale-110 md:transition-all md:duration-300">
        <img
          className="aspect-square object-contain w-[84px] md:w-full group-hover:rounded-2xl transition-all duration-300"
          src={podcast.logo ? podcast.logo : ''}
          alt={podcast.name}
        />
        <div className="flex flex-col gap-[10px] md:gap-4">
          <span className="text-white text-sm md:text-xl md:leading-5 font-medium">
            {podcast.name}
          </span>
          <span className="text-white text-xs md:text-base md:leading-6">
            {podcast.host}
          </span>
        </div>
      </div>
    </Link>
  );
};
