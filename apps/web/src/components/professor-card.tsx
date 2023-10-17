import { useTranslation } from 'react-i18next';

import NostrIcon from '../assets/icons/nostr_blue.svg?react';
import TwitterIcon from '../assets/icons/twitter_blue.svg?react';
import WebIcon from '../assets/icons/web_blue.svg?react';

interface ProfessorCardProps extends React.HTMLProps<HTMLDivElement> {
  name: string;
}

const CourseAndTutorials = () => {
  return (
    <div className="flex flex-wrap content-center items-center gap-5 self-stretch text-blue-800">
      <div className="flex items-center gap-2 text-lg">
        <div className="font-semibold">0</div>
        <div className="">Courses</div>
      </div>
      <span className="text-3xl">•</span>
      <div className="flex items-center gap-2 text-lg">
        <div className="font-semibold">15</div>
        <div className="">Tutorials</div>
      </div>
    </div>
  );
};

const TopicTags = () => {
  return (
    <div className="mt-4 flex flex-wrap  items-start gap-2.5 self-stretch text-sm text-blue-700">
      <div className="shadow-md-dark flex items-center rounded-lg bg-gray-100 px-2 py-1">
        privacy
      </div>
      <div className="shadow-md-dark flex items-center rounded-lg bg-gray-100 px-4 py-1">
        lightning network
      </div>
      <div className="shadow-md-dark flex items-center rounded-lg bg-gray-100 px-4 py-1">
        mining
      </div>
    </div>
  );
};

const SocialLinks = () => {
  return (
    <div className="mt-2 flex justify-between self-stretch px-1">
      <NostrIcon className="h-20 text-blue-800" />
      <TwitterIcon className="h-20" />
      <WebIcon className="h-20" />
    </div>
  );
};

export const ProfessorCard = ({ name, ...props }: ProfessorCardProps) => {
  const { t } = useTranslation();

  return (
    <div {...props}>
      <div className="border-blue-1000 bg-beige-300 flex flex-col items-start gap-2.5 rounded-2xl border p-2">
        <div className="flex max-w-[310px] flex-col items-start">
          <div className="border-blue-1000 flex flex-col items-center self-stretch rounded-t-2xl border bg-orange-500 px-5 py-2">
            <span className="text-beige-300 text-3xl font-semibold">
              {name}
            </span>
          </div>
          <div className="border-blue-1000 flex flex-col items-center justify-center gap-2.5 self-stretch border px-0">
            <div className="bg-gradient-diagonal mt-2 flex w-full flex-col items-center">
              <img
                src="https://github.com/DecouvreBitcoin/sovereign-university-data/blob/dev/resources/professors/loic%20Morel/assets/profil.png?raw=true"
                alt="Professor"
                className="mt-8 h-28 w-28 rounded-full bg-white"
              />
            </div>
            <div className="mt-2 flex flex-col items-center justify-center self-stretch px-5 py-0">
              <CourseAndTutorials />
              <TopicTags />
            </div>
            <div className="flex w-full flex-col px-16">
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
