import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { FullProfessor } from '@blms/types';

import { formatNameForURL } from '#src/utils/string.js';

import DonateLightning from '../assets/icons/tips-icon.svg';
import { useDisclosure } from '../hooks/index.ts';

import { SocialLinks, TopicTags } from './professor-card.tsx';
import { TipModal } from './tip-modal.tsx';

interface AuthorCardFullProps extends React.HTMLProps<HTMLDivElement> {
  professor: FullProfessor;
}

export const AuthorCardFull = ({
  professor,
  ...props
}: AuthorCardFullProps) => {
  const { t } = useTranslation();

  const {
    open: openTipModal,
    isOpen: isTipModalOpen,
    close: closeTipModal,
  } = useDisclosure();

  const showAllCounts =
    professor?.coursesCount > 0 &&
    professor?.tutorialsCount > 0 &&
    professor?.lecturesCount > 0;

  return (
    <div {...props}>
      <article className="flex flex-col md:p-0 gap-5">
        <div className="flex max-md:flex-col max-md:gap-4 md:items-top gap-7">
          <div className="rounded-[20px] bg-white p-2 shrink-0 w-[280px]">
            {/* eslint-disable tailwindcss/no-contradicting-classname */}
            <Link
              to={`/professor/${formatNameForURL(professor?.name || '')}-${professor?.id}`}
              className="rounded-[20px] flex flex-col items-center  bg-gradient-to-b from-[#411800] to-[#FF5C00] to-[250px] p-2.5 relative overflow-hidden"
            >
              <span className="mb-2.5 w-full text-center title-large-sb-24px text-white z-10">
                {professor?.name}
              </span>

              <img
                src={professor?.picture}
                alt={professor?.name}
                className="size-32 rounded-full z-10  object-cover [overflow-clip-margin:_unset]"
              />
              {(professor?.coursesCount > 0 ||
                professor?.tutorialsCount > 0 ||
                professor?.lecturesCount > 0) && (
                <div className="flex gap-4 items-end mt-2.5 z-10 whitespace-nowrap flex-wrap justify-center">
                  {/* Courses */}
                  {professor?.coursesCount > 0 && (
                    <div className="flex flex-col gap">
                      <span className="text-5xl leading-[116%] text-center text-white">
                        {professor?.coursesCount}
                      </span>
                      <span className="font-semibold leading-[133%] text-center text-white">
                        {t('words.courses')}
                      </span>
                    </div>
                  )}
                  {/* Tutorials */}
                  {professor?.tutorialsCount > 0 && (
                    <div className="flex flex-col gap">
                      <span className="text-5xl leading-[116%] text-center text-white">
                        {professor?.tutorialsCount}
                      </span>
                      <span className="font-semibold leading-[133%] text-center text-white">
                        {t('words.tutorials')}
                      </span>
                    </div>
                  )}
                  {/* Lectures */}
                  {professor?.lecturesCount > 0 && (
                    <div className="flex flex-col gap">
                      <span className="text-5xl leading-[116%] text-center text-white">
                        {professor?.lecturesCount}
                      </span>
                      <span className="font-semibold leading-[133%] text-center text-white">
                        {t('words.lectures')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <BackgroundAuthorCardElement showAllCounts={showAllCounts} />
            </Link>
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
          </div>

          <div className="flex flex-col items-start align-top">
            <div className="flex flex-wrap content-center items-center gap-2 self-stretch text-sm text-white sm:gap-5 sm:text-2xl max-w-[296px] lg:max-w-[596px]">
              <p className="text-sm md:text-base">{professor.bio}</p>
            </div>
            <div className="items-start m-0">
              <TopicTags professor={professor} />
            </div>

            <div className="items-start m-0 gap-x-6">
              <SocialLinks professor={professor} />
            </div>
          </div>
        </div>
      </article>
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
  showAllCounts,
}: {
  showAllCounts: boolean;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 45"
      fill="none"
      className={`absolute bottom-0 h-full ${showAllCounts ? 'max-h-[240px]' : 'max-h-[140px]'}`}
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
          <stop stopColor="#853000" />
          <stop offset="1" />
        </linearGradient>
      </defs>
    </svg>
  );
};
