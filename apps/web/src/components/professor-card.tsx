import { formatNameForURL } from '@blms/shared';
import type { FormattedProfessor } from '@blms/types';
import { cn, DividerSimple, Image, TextTag } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  TbBook,
  TbBrandLinkedin,
  TbChevronRight,
  TbMicrophone2,
  TbNotebook,
} from 'react-icons/tb';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { resourceImgUrl } from '#src/utils/index.js';
import NostrIcon from '../assets/icons/nostr-primary.svg';
import DonateLightning from '../assets/icons/tips-icon.svg';
import WebIcon from '../assets/icons/world-primary.svg';
import TwitterIcon from '../assets/icons/x-primary.svg';
import { TipModal } from './tip-modal.tsx';

interface ProfessorCardProps extends React.HTMLProps<HTMLDivElement> {
  professor: FormattedProfessor;
  hasDonateButton?: boolean;
  mobileSize?: 'small' | 'medium';
  category?: string;
}

export const ProfessorCard = ({ professor, category }: ProfessorCardProps) => {
  const { t } = useTranslation();

  return (
    <Link
      to={`/professor/${formatNameForURL(professor.name || '')}-${professor.id}${category ? `#${category}` : ''}`}
      className="flex w-full xl:max-w-[502px] gap-2 border border-neutral-100 rounded-2xl text-black hover:bg-neutral-50"
    >
      <Image
        src={resourceImgUrl(professor, 'profile.webp')}
        alt={professor.name}
        breakpoints={{ default: 200, lg: 400 }}
        className="rounded-l-2xl object-cover [overflow-clip-margin:_unset] object-center w-full max-w-[93px] lg:max-w-[170px] shrink-0 h-20 lg:h-36"
      />
      <div className="flex items-center gap-1.5 lg:gap-4 pl-4 pr-2 py-2.5 w-full overflow-hidden">
        <div className="flex flex-col w-full min-w-0">
          <span className="w-full subtitle-base lg:line-clamp-1 max-lg:truncate lg:title-medium lg:mt-2">
            {professor.name}
          </span>
          {professor.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-2 overflow-hidden whitespace-nowrap max-lg:hidden">
              {professor.tags.slice(0, 3).map((tag) => (
                <TextTag key={tag} variant="grey" size="small">
                  {tag}
                </TextTag>
              ))}
            </div>
          )}
          <DividerSimple className="mt-3 max-lg:hidden" />
          <div className="flex items-center gap-3 lg:gap-0 max-lg:mt-2">
            {professor.coursesCount > 0 && (
              <span className="flex items-center lg:p-2 lg:px-1 gap-1">
                <TbBook className="text-brown-400 max-lg:hidden" size={16} />
                <span className="body-extra-small lg:body-extra-small-bold text-brown-400 lg:text-brown-800">
                  {t('professors.coursesCount', {
                    count: professor.coursesCount,
                  })}
                </span>
              </span>
            )}
            {professor.tutorialsCount > 0 && (
              <span className="flex items-center lg:p-2 lg:px-1 gap-1">
                <TbNotebook
                  className="text-brown-400 max-lg:hidden"
                  size={16}
                />
                <span className="body-extra-small lg:body-extra-small-bold text-brown-400 lg:text-brown-800">
                  {t('professors.tutorialsCount', {
                    count: professor.tutorialsCount,
                  })}
                </span>
              </span>
            )}
            {professor.lecturesCount > 0 && (
              <span className="flex items-center lg:p-2 lg:px-1 gap-1">
                <TbMicrophone2
                  className="text-brown-400 max-lg:hidden"
                  size={16}
                />
                <span className="body-extra-small lg:body-extra-small-bold text-brown-400 lg:text-brown-800">
                  {t('professors.lecturesCount', {
                    count: professor.lecturesCount,
                  })}
                </span>
              </span>
            )}
          </div>
        </div>
        <TbChevronRight className="shrink-0 text-neutral-300" size={20} />
      </div>
    </Link>
  );
};

export const ProfessorCardReduced = ({
  professor,
  hasDonateButton,
  mobileSize = 'small',
}: ProfessorCardProps) => {
  const {
    open: openTipModal,
    isOpen: isTipModalOpen,
    close: closeTipModal,
  } = useDisclosure();
  const { t } = useTranslation();

  const numberCountClass = `text-5xl leading-[116%] text-center text-white${mobileSize === 'small' ? ' max-md:title-large-24px' : ''}`;
  const wordCountClass = `font-semibold leading-[133%] text-center text-white${mobileSize === 'small' ? ' max-md:body-12px' : ''}`;

  return (
    <div
      className={cn(
        'rounded-[20px] p-2 border-2 border-newBlack-1 bg-newGray-6 size-fit flex flex-col',
        mobileSize === 'small' && 'max-md:p-1 max-md:border',
      )}
    >
      <Link
        to={`/professor/${formatNameForURL(professor.name || '')}-${professor.id}`}
        className={cn(
          'rounded-[20px] flex flex-col items-center bg-gradient-to-b from-[#411800] to-[#FF5C00] to-[200px] p-2.5 relative overflow-hidden w-[280px]',
          mobileSize === 'small' &&
            'max-md:w-[137px] max-md:px-1 max-md:pb-4 max-md:pt-1 max-md:to-[100px]',
        )}
      >
        <span
          className={cn(
            'mb-1 md:mb-2.5 w-full text-center title-large-sb-24px text-white z-10 flex items-center justify-center',
            mobileSize === 'small' &&
              'max-md:h-10 max-md:subtitle-small-sb-14px',
          )}
        >
          {professor.name}
        </span>

        <Image
          src={resourceImgUrl(professor, 'profile.webp')}
          alt={professor.name}
          width={128}
          height={128}
          breakpoints={{ default: 200, md: 300 }}
          className={cn(
            'size-32 rounded-full z-10 object-cover [overflow-clip-margin:_unset]',
            mobileSize === 'small' && 'max-md:size-[69px]',
          )}
        />

        <div className="flex gap-4 items-end mt-2.5 z-10">
          {professor.coursesCount > 0 && (
            <div className="flex flex-col gap">
              <span className={numberCountClass}>{professor.coursesCount}</span>
              <span className={wordCountClass}>{t('words.courses')}</span>
            </div>
          )}
          {professor.tutorialsCount > 0 && (
            <div className="flex flex-col gap">
              <span className={numberCountClass}>
                {professor.tutorialsCount}
              </span>
              <span className={wordCountClass}>{t('words.tutorials')}</span>
            </div>
          )}
          {professor.lecturesCount > 0 && (
            <div
              className={cn(
                'flex flex-col gap',
                professor.tutorialsCount > 0 &&
                  professor.coursesCount > 0 &&
                  mobileSize === 'small' &&
                  'max-md:hidden',
              )}
            >
              <span className={numberCountClass}>
                {professor.lecturesCount}
              </span>
              <span className={wordCountClass}>{t('words.lectures')}</span>
            </div>
          )}
        </div>

        {/* Background element */}
        <BackgroundAuthorCardElement reduced />
      </Link>

      {hasDonateButton && (
        <div
          className={cn(
            'flex items-center justify-center py-4 px-4',
            mobileSize === 'small' && 'max-md:hidden',
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openTipModal();
            }}
            className="flex items-center overflow-hidden shrink-0"
          >
            <img
              src={DonateLightning}
              alt={professor.name}
              className="size-8"
            />
            <div className="subtitle-small-med-14px text-darkOrange-6 whitespace-pre-line max-w-[200px]">
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

export const TopicTags = ({ professor }: ProfessorCardProps) => {
  return (
    <div className="mt-4 flex flex-wrap lg:mx-auto lg:items-center gap-2.5 lg:justify-center text-xs">
      {professor.tags?.map((tag) => (
        <span
          key={tag}
          className="flex items-center desktop-typo1  px-2 py-1 rounded-lg bg-accent capitalize"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export const SocialLinks = ({ professor }: ProfessorCardProps) => {
  return (
    <div className="flex items-center gap-4 text-primary max-md:order-2 mt-2 md:mt-2.5">
      {professor.links.twitter && (
        <button
          type="button"
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
          <img src={TwitterIcon} alt="X" className="block" />
        </button>
      )}
      {professor.links.nostr && (
        <button
          type="button"
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
          type="button"
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
      {professor.links.linkedin && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(
              professor.links.linkedin as string,
              '_blank',
              'noopener noreferrer',
            );
          }}
        >
          <TbBrandLinkedin size={28} className="shrink-0" />
        </button>
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
          ? 'absolute bottom-0 h-full max-h-[110px] md:max-h-35'
          : 'absolute bottom-0 h-full max-h-30 lg:max-h-[290px]'
      }
      role="img"
      aria-label="Background effect"
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
