/* eslint-disable react/jsx-no-comment-textnodes */

import { useTranslation } from 'react-i18next';

import type { FormattedProfessor } from '@blms/types';

import WebIcon from '../assets/icons/world-primary.svg';
import TwitterIcon from '../assets/icons/x-primary.svg';

interface ProfessorCardProps extends React.HTMLProps<HTMLDivElement> {
  professor: FormattedProfessor;
}

const CourseAndTutorials = ({ professor }: ProfessorCardProps) => {
  const { t } = useTranslation();
  const showLectures =
    professor.coursesCount === 0 && professor.tutorialsCount === 0;
  return (
    <div className="flex content-center items-center gap-2 lg:gap-x-6 text-white">
      {professor.coursesCount > 0 && (
        <div className="flex flex-col items-center gap-2">
          <div className="font-normal text-2xl lg:text-6xl">
            {professor.coursesCount}
          </div>
          <div className="font-semibold text-xs lg:text-base">
            {t('words.courses')}
          </div>
        </div>
      )}
      {professor.tutorialsCount > 0 && (
        <div className="flex flex-col items-center gap-2">
          <div className="font-normal text-2xl lg:text-6xl">
            {professor.tutorialsCount}
          </div>
          <div className="font-semibold text-xs lg:text-base">
            {t('words.tutorials')}
          </div>
        </div>
      )}
      {showLectures && professor.lecturesCount > 0 && (
        <div className="flex flex-col items-center gap-2">
          <div className="font-normal text-2xl lg:text-6xl">
            {professor.lecturesCount}
          </div>
          <div className="font-semibold text-xs lg:text-base">
            {t('words.lectures')}
          </div>
        </div>
      )}
    </div>
  );
};

export const TopicTags = ({ professor }: ProfessorCardProps) => {
  return (
    <div className="mt-4 flex flex-wrap lg:mx-auto lg:items-center gap-2.5 lg:justify-center text-xs text-white">
      {professor.tags?.map((tag) => (
        <span
          key={tag}
          className="flex items-center desktop-typo1 rounded-lg bg-[#FFFFFF40] px-2 py-1 capitalize"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export const SocialLinks = ({ professor }: ProfessorCardProps) => {
  return (
    <div
      className="mt-5 flex w-full justify-evenly self-stretch px-1 text-primary gap-x-6
    "
    >
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
          <img src={TwitterIcon} alt="Twitter" className="block" />
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
          <img src={WebIcon} alt="Website" className="block" />
        </button>
      )}
    </div>
  );
};

export const ProfessorCard = ({ professor, ...props }: ProfessorCardProps) => {
  return (
    <div
      className="flex  flex-wrap w-full p-2 md:p-7 rounded-2xl border-t border-t-newGray-4 bg-newGray-6 shadow-course-navigation mt-8"
      {...props}
    >
      <div className="rounded-[10px] size-full md:rounded-[20px] flex max-md:flex-col md:items-end gap-4 bg-white w-[137px] sm:w-[226px] lg:w-[296px]">
        <div className="rounded-[10px] size-full md:rounded-[20px] p-1 lg:p-2 border-1 md:border-2 border-white">
          {/* eslint-disable-next-line tailwindcss/no-contradicting-classname */}
          <div className="rounded-[10px] h-full md:rounded-[20px] py-4 flex flex-col items-center bg-gradient-to-b from-[#411800] to-[#FF5C00] to-[180px] lg:to-[260px] p-2.5 relative overflow-hidden">
            <span className="max-w-48 mb-8 w-full text-center text-base lg:title-large-sb-24px text-white lg:uppercase z-10 absolute">
              {professor.name}
            </span>
            <img
              src={professor.picture}
              alt={professor.name}
              className="size-16 lg:size-32 rounded-full z-10 mt-12 lg:mt-20"
            />
            <div className="flex gap-4 items-end mt-2.5 z-10">
              <CourseAndTutorials professor={professor} />
            </div>
            <div className="hidden lg:flex z-10 flex-col items-center justify-center px-3 py-0">
              <TopicTags professor={professor} />
              <SocialLinks professor={professor} />
            </div>

            {/* Background element */}
            <BackgroundAuthorCardElement />
          </div>
        </div>
      </div>
    </div>
  );
};

const BackgroundAuthorCardElement = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 45"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className="absolute bottom-0 h-full max-h-[120px] lg:max-h-[320px]"
    >
      <path
        d="M147.147 1.98324C142.545 0.222654 137.455 0.222651 132.853 1.98323L12.8534 47.8939C5.11227 50.8556 0 58.2852 0 66.5735V259.249C0 270.295 8.95431 279.249 20 279.249H260C271.046 279.249 280 270.295 280 259.249V66.5735C280 58.2852 274.888 50.8556 267.147 47.8939L147.147 1.98324Z"
        fill="url(#paint0_linear_5830_16430)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_5830_16430"
          x1="140"
          y1="-0.750977"
          x2="140"
          y2="279.249"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#853000" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
      </defs>
    </svg>
  );
};
