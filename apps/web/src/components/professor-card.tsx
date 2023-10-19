import { useTranslation } from 'react-i18next';

import NostrIcon from '../assets/icons/nostr_blue.svg?react';
import TwitterIcon from '../assets/icons/twitter_blue.svg?react';
import WebIcon from '../assets/icons/web_blue.svg?react';
import { TRPCRouterOutput } from '../utils/trpc';

interface ProfessorCardProps extends React.HTMLProps<HTMLDivElement> {
  professor: NonNullable<TRPCRouterOutput['content']['getProfessor']>;
}

const CourseAndTutorials = ({ professor }: ProfessorCardProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap content-center items-center gap-2 self-stretch text-base  text-blue-800">
      <div className="flex items-center gap-2">
        <div className="font-semibold">{professor.courses_count}</div>
        <div className="">{t('words.courses')}</div>
      </div>
      <span className="text-3xl">•</span>
      <div className="flex items-center gap-2">
        <div className="font-semibold">{professor.tutorials_count}</div>
        <div className="">{t('words.tutorials')}</div>
      </div>
    </div>
  );
};

const TopicTags = ({ professor }: ProfessorCardProps) => {
  return (
    <div className="mt-4 flex flex-wrap  items-start gap-2.5 self-stretch text-xs text-blue-700">
      {professor.tags.map((tag) => {
        return (
          <div className="shadow-md-dark flex items-center rounded-lg bg-gray-100 px-2 py-1">
            {tag}
          </div>
        );
      })}
    </div>
  );
};

const SocialLinks = ({ professor }: ProfessorCardProps) => {
  return (
    <div className="mt-2 flex justify-between self-stretch px-1">
      {professor.links.twitter && (
        <a
          href={professor.links.twitter}
          target="_blank"
          rel="noopener noreferrer"
        >
          <TwitterIcon className="h-20" />
        </a>
      )}
      {professor.links.website && (
        <a
          href={professor.links.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WebIcon className="h-20" />
        </a>
      )}
    </div>
  );
};

export const ProfessorCard = ({ professor, ...props }: ProfessorCardProps) => {
  const { t } = useTranslation();

  return (
    <div {...props}>
      <div className="border-blue-1000 bg-beige-300 flex flex-col items-start gap-2.5 rounded-2xl border p-1">
        <div className="flex w-[240px] flex-col items-start">
          <div className="border-blue-1000 flex flex-col items-center self-stretch rounded-t-2xl border bg-orange-500 px-5 py-2">
            <span className="text-beige-300 break-words text-xl font-semibold">
              {professor.name}
            </span>
          </div>
          <div className="border-blue-1000 flex flex-col items-center justify-center gap-2.5 self-stretch border px-0">
            <div className="bg-gradient-diagonal flex w-full flex-col items-center">
              <img
                src={professor.picture}
                alt="Professor"
                className="mt-8 h-28 w-28 rounded-full bg-white"
              />
            </div>
            <div className="mt-2 flex flex-col items-center justify-center self-stretch px-5 py-0">
              <CourseAndTutorials professor={professor} />
              <TopicTags professor={professor} />
            </div>
            <div className="flex w-full flex-col px-16">
              <SocialLinks professor={professor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
