import { useTranslation } from 'react-i18next';

import type { FormattedProfessor } from '@blms/types';

import TwitterIcon from '../assets/icons/twitter_blue.svg';
import WebIcon from '../assets/icons/web_blue.svg';

interface ProfessorCardProps extends React.HTMLProps<HTMLDivElement> {
  professor: FormattedProfessor;
}

const CourseAndTutorials = ({ professor }: ProfessorCardProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap content-center items-center gap-2 self-stretch text-base  text-blue-800">
      <div className="flex items-center gap-2">
        <div className="font-semibold">{professor.coursesCount}</div>
        <div className="">{t('words.courses')}</div>
      </div>
      <span className="text-3xl">•</span>
      <div className="flex items-center gap-2">
        <div className="font-semibold">{professor.tutorialsCount}</div>
        <div className="">{t('words.tutorials')}</div>
      </div>
    </div>
  );
};

const TopicTags = ({ professor }: ProfessorCardProps) => {
  return (
    <div className="mt-4 flex flex-wrap  items-start gap-2.5 self-stretch text-xs text-blue-700">
      {professor.tags?.map((tag) => {
        return (
          <div
            key={tag}
            className="shadow-md-dark flex items-center rounded-lg bg-gray-100 px-2 py-1"
          >
            {tag}
          </div>
        );
      })}
    </div>
  );
};

const SocialLinks = ({ professor }: ProfessorCardProps) => {
  return (
    <div className="mt-2 flex w-full justify-evenly self-stretch px-1">
      {professor.links.twitter && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(
              professor.links.twitter as string,
              '_blank',
              'noopener noreferrer',
            );
          }}
        >
          <img src={TwitterIcon} alt="web icon" className="my-6 block" />
        </button>
      )}
      {professor.links.website && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(
              professor.links.website as string,
              '_blank',
              'noopener noreferrer',
            );
          }}
        >
          <img src={WebIcon} alt="web icon" className="my-6 block" />
        </button>
      )}
    </div>
  );
};

export const ProfessorCard = ({ professor, ...props }: ProfessorCardProps) => {
  return (
    <div {...props}>
      <div className="border-blue-1000 bg-beige-300 flex h-full flex-col items-start gap-2.5 rounded-[1.25rem] border p-1">
        <div className="flex w-[240px] grow flex-col">
          <div className="border-blue-1000 flex flex-col rounded-t-2xl border bg-orange-500 px-5 py-2">
            <span className="text-beige-300 break-words text-xl font-semibold">
              {professor.name}
            </span>
          </div>
          <div className="border-blue-1000 flex h-full flex-col items-center justify-center gap-2.5 self-stretch rounded-b-2xl border px-0">
            <div className="bg-gradient-diagonal flex w-full flex-col items-center">
              <img
                src={professor.picture}
                alt="Professor"
                className="object-cover mt-8 size-28 rounded-full bg-white"
              />
            </div>
            <div className="mt-2 flex h-full flex-col items-center justify-center self-stretch px-5 py-0">
              <CourseAndTutorials professor={professor} />
              <TopicTags professor={professor} />
            </div>
            <div className="flex w-full flex-col px-4">
              <SocialLinks professor={professor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
