import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  BsGithub,
  BsTwitterX,
  BsYoutube,
  // BsDiscord,
  // BsFacebook,
  // BsLinkedin,
} from 'react-icons/bs';

import { cn } from '@blms/ui';

import { useGreater } from '#src/hooks/use-greater.ts';

import OrangePill from '../assets/icons/footer_pill.webp';
import PlanBLogoBlack from '../assets/logo/planb_logo_horizontal_black_orangepill_gradient.svg';
import PlanBLogoWhite from '../assets/logo/planb_logo_horizontal_white_orangepill_gradient.svg';

interface FooterProps {
  variant?: 'light' | 'dark';
  color?: string;
}

export const Footer = ({ variant = 'light', color }: FooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className="pt-16 md:pt-24 lg:pt-40 w-full">
      <div
        className={cn(
          'flex w-full flex-col',
          color ??
            (variant === 'dark'
              ? 'bg-white text-black'
              : 'bg-black text-white'),
        )}
      >
        <div className="relative z-10 flex w-full flex-col py-5 lg:py-28">
          <div className="flex flex-row">
            <div className="w-full mx-auto flex flex-col gap-6 lg:gap-20 px-7 xl:justify-center xl:mr-40 lg:flex-row">
              <div className="flex flex-col gap-5 md:gap-8">
                <img
                  src={variant === 'light' ? PlanBLogoWhite : PlanBLogoBlack}
                  alt="Logo Plan B Network"
                  className="w-36 md:w-60 self-start"
                />
                <SocialNetworks variant={variant} />
              </div>
              <div className="flex flex-row gap-7 min-[480px]:gap-12 sm:gap-16 md:gap-20 lg:gap-24 xl:gap-32">
                <div className="flex flex-col lg:ml-6">
                  <h4 className="mb-2 text-xs min-[480px]:text-base font-bold">
                    {t('words.content')}
                  </h4>
                  <ul className="flex flex-col gap-2 text-xs min-[480px]:text-base leading-snug">
                    <li>
                      <Link to={'/courses'}>{t('words.courses')}</Link>
                    </li>
                    <li>
                      <Link to={'/resources'}>{t('words.resources')}</Link>
                    </li>
                    <li>
                      <Link to={'/tutorials'}>{t('words.tutorials')}</Link>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col">
                  <h4 className="mb-2 text-xs min-[480px]:text-base font-bold">
                    {t('words.network')}
                  </h4>
                  <ul className="flex flex-col gap-2 text-xs min-[480px]:text-base leading-snug">
                    <li>
                      <Link to={'/events'}>{t('words.events')}</Link>
                    </li>
                    <li>
                      <Link to={'/node-network'}>{t('words.nodeNetwork')}</Link>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col">
                  <h4 className="mb-2 text-xs min-[480px]:text-base font-bold">
                    {t('words.about')}
                  </h4>
                  <ul className="flex flex-col gap-2 text-xs min-[480px]:text-base leading-snug">
                    <li>
                      <Link to={'/manifesto'}>{t('words.ourStory')}</Link>
                    </li>
                    <li>
                      <Link to={'/professors'}>{t('words.professors')}</Link>
                    </li>
                    <li>
                      <Link to={'/public-communication'}>
                        {t('words.public')}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <img
            src={OrangePill}
            className="absolute -right-0 h-[102px] md:h-56 lg:h-72 -top-12 md:-top-24 lg:-top-32 lg:right-12"
            alt="Orange Pill"
          />
        </div>
      </div>
    </footer>
  );
};

const SocialNetworks = ({ variant }: { variant: FooterProps['variant'] }) => {
  const isScreenLg = useGreater('lg');
  const iconSize = isScreenLg ? 24 : 18;

  const iconClasses = cn('', variant === 'light' ? 'text-white' : 'text-black');

  return (
    <div className="flex gap-5">
      <a
        href="https://twitter.com/planb_network"
        target="_blank"
        rel="noreferrer"
      >
        <BsTwitterX size={iconSize} className={iconClasses} />{' '}
      </a>
      <a
        href="https://github.com/DecouvreBitcoin/sovereign-university-data"
        target="_blank"
        rel="noreferrer"
      >
        <BsGithub size={iconSize} className={iconClasses} />{' '}
      </a>
      <a
        href="https://www.youtube.com/@PlanBNetwork"
        target="_blank"
        rel="noreferrer"
      >
        <BsYoutube size={iconSize} className={iconClasses} />
      </a>
      {/* <a
        href="https://www.facebook.com/profile.php?id=61556543067522"
        target="_blank"
        rel="noreferrer"
      >
        <BsFacebook size={iconSize} className={iconClasses} />{' '}
      </a>
      <a href="https://discord.gg/CHvZAhJCBh" target="_blank" rel="noreferrer">
        <BsDiscord size={iconSize} className={iconClasses} />{' '}
      </a>
      <a
        href="https://www.linkedin.com/company/planb-network/"
        target="_blank"
        rel="noreferrer"
      >
        <BsLinkedin size={iconSize} className={iconClasses} />{' '}
      </a> */}
    </div>
  );
};
