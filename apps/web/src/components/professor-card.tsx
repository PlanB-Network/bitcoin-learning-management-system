/* eslint-disable react/jsx-no-comment-textnodes */

import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

import type { FormattedProfessor } from '@blms/types';

import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { formatNameForURL } from '#src/utils/string.ts';

import NostrIcon from '../assets/icons/nostr-primary.svg';
import DonateLightning from '../assets/icons/tips-icon.svg';
import WebIcon from '../assets/icons/world-primary.svg';
import TwitterIcon from '../assets/icons/x-primary.svg';

import { TipModal } from './tip-modal.tsx';

interface ProfessorCardProps extends React.HTMLProps<HTMLDivElement> {
  professor: FormattedProfessor;
  hasDonateButton?: boolean;
}

const CourseAndTutorials = ({ professor }: ProfessorCardProps) => {
  const { t } = useTranslation();
  const showLectures =
    professor.coursesCount === 0 && professor.tutorialsCount === 0;
  return (
    <section className="flex content-center items-center gap-2 lg:gap-x-6 text-white">
      {professor.coursesCount > 0 && (
        <div className="flex flex-col items-center gap-2">
          <span className="font-normal text-2xl lg:text-6xl">
            {professor.coursesCount}
          </span>
          <span className="font-semibold text-xs lg:text-base text-center">
            {t('words.courses')}
          </span>
        </div>
      )}
      {professor.tutorialsCount > 0 && (
        <div className="flex flex-col items-center gap-2">
          <span className="font-normal text-2xl lg:text-6xl">
            {professor.tutorialsCount}
          </span>
          <span className="font-semibold text-xs lg:text-base text-center">
            {t('words.tutorials')}
          </span>
        </div>
      )}
      {showLectures && professor.lecturesCount > 0 && (
        <div className="flex flex-col items-center gap-2">
          <span className="font-normal text-2xl lg:text-6xl">
            {professor.lecturesCount}
          </span>
          <span className="font-semibold text-xs lg:text-base text-center">
            {t('words.lectures')}
          </span>
        </div>
      )}
    </section>
  );
};

export const TopicTags = ({ professor }: ProfessorCardProps) => {
  return (
    <div className="mt-4 flex flex-wrap lg:mx-auto lg:items-center gap-2.5 lg:justify-center text-xs text-white">
      {professor.tags?.map((tag) => (
        <span
          key={tag}
          className="flex items-center desktop-typo1  px-2 py-1 rounded-lg bg-[#FFFFFF40] capitalize"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export const SocialLinks = ({ professor }: ProfessorCardProps) => {
  return (
    <div className="mt-4 md:mt-5 flex w-full justify-center px-1 text-primary gap-x-6">
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
      {professor.links.nostr && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const baseUrl = 'https://primal.net/p/';
            const nostrLink = professor.links.nostr as string;
            const fullUrl =
              nostrLink.startsWith('http://') ||
              nostrLink.startsWith('https://')
                ? nostrLink
                : baseUrl + nostrLink;
            window.open(fullUrl, '_blank', 'noopener noreferrer');
          }}
        >
          <img src={NostrIcon} alt="Nostr" className="block" />
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
    <section
      className="flex flex-wrap w-full p-2 md:p-7 rounded-2xl border-t border-t-newGray-4 bg-newGray-6 shadow-course-navigation mt-8"
      {...props}
    >
      <div className="rounded-[10px] size-full md:rounded-[20px] flex max-md:flex-col md:items-end gap-4 bg-white w-[137px] sm:w-[226px] lg:w-[296px]">
        <div className="rounded-[10px] size-full md:rounded-[20px] p-1 lg:p-2 border-1 md:border-2 border-white">
          {/* eslint-disable-next-line tailwindcss/no-contradicting-classname */}
          <div className="rounded-[10px] h-full md:rounded-[20px] py-4 flex flex-col items-center bg-gradient-to-b from-[#411800] to-[#FF5C00] to-[180px] lg:to-[240px] p-2.5 relative overflow-hidden">
            <span className="max-w-48 mb-8 w-full text-center text-base lg:title-large-sb-24px text-white lg:uppercase z-10 absolute">
              {professor.name}
            </span>
            <img
              src={professor.picture}
              alt={professor.name}
              className="size-16 lg:size-32 rounded-full z-10 mt-12 lg:mt-20 object-cover [overflow-clip-margin:_unset]"
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
    </section>
  );
};

export const ProfessorCardReduced = ({
  professor,
  hasDonateButton,
}: ProfessorCardProps) => {
  const {
    open: openTipModal,
    isOpen: isTipModalOpen,
    close: closeTipModal,
  } = useDisclosure();

  return (
    <div className="rounded-[20px] p-2 border-2 border-newBlack-1 max-md:mx-auto h-fit flex flex-col">
      <Link
        to={`/professor/${formatNameForURL(professor.name || '')}-${professor.id}`}
        target="_blank"
        // eslint-disable-next-line tailwindcss/no-contradicting-classname
        className="rounded-[20px] flex flex-col items-center bg-gradient-to-b from-[#411800] to-[#FF5C00] to-[200px] p-2.5 relative overflow-hidden w-[280px]"
      >
        <span className="mb-2.5 w-full text-center title-large-sb-24px text-white z-10">
          {professor.name}
        </span>
        <img
          src={professor.picture}
          alt={professor.name}
          className="size-32 rounded-full z-10 object-cover [overflow-clip-margin:_unset]"
        />

        <div className="flex gap-4 items-end mt-2.5 z-10">
          {professor.coursesCount > 0 && (
            <div className="flex flex-col gap">
              <span className="text-5xl leading-[116%] text-center text-white">
                {professor.coursesCount}
              </span>
              <span className="font-semibold leading-[133%] text-center text-white">
                {t('words.courses')}
              </span>
            </div>
          )}
          {professor.tutorialsCount > 0 && (
            <div className="flex flex-col gap">
              <span className="text-5xl leading-[116%] text-center text-white">
                {professor.tutorialsCount}
              </span>
              <span className="font-semibold leading-[133%] text-center text-white">
                {t('words.tutorials')}
              </span>
            </div>
          )}
          {professor.lecturesCount > 0 && (
            <div className="flex flex-col gap">
              <span className="text-5xl leading-[116%] text-center text-white">
                {professor.lecturesCount}
              </span>
              <span className="font-semibold leading-[133%] text-center text-white">
                {t('words.lectures')}
              </span>
            </div>
          )}
        </div>

        {/* Background element */}
        <BackgroundAuthorCardElement reduced />
      </Link>

      {hasDonateButton && (
        <div className="flex items-center justify-center py-4 lg:py-[18px] px-[18px]">
          <button
            className="flex items-center overflow-hidden shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openTipModal();
            }}
          >
            <img
              src={DonateLightning}
              alt={professor.name}
              className="size-8"
            />
            <div className="subtitle-small-med-14px text-darkOrange-6 whitespace-pre-line">
              {t('professors.tips.authorSupport')}
            </div>
          </button>
        </div>
      )}

      {isTipModalOpen && (
        <TipModal
          isOpen={isTipModalOpen}
          onClose={closeTipModal}
          lightningAddress={professor.tips.lightningAddress as string}
          userName={professor.name}
        />
      )}
    </div>
  );
};

const BackgroundAuthorCardElement = ({
  reduced = false,
}: {
  reduced?: boolean;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 45"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className={
        reduced
          ? 'absolute bottom-0 h-full max-h-[140px]'
          : 'absolute bottom-0 h-full max-h-[120px] lg:max-h-[290px]'
      }
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
