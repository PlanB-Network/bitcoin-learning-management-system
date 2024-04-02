import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AiOutlineMail } from 'react-icons/ai';
import {
  BsDiscord,
  BsFacebook,
  BsGithub,
  BsLinkedin,
  BsTwitter,
  BsYoutube,
} from 'react-icons/bs';

import { cn } from '@sovereign-university/ui';

import OrangePill from '../../assets/footer_pill.svg';
import PlanBLogo from '../../assets/planb_logo_horizontal_white_whitepill.svg';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

interface FooterProps {
  variant?: 'light' | 'dark' | 'course';
  color?: string;
}

const SocialNetworks = () => {
  const isScreenXl = useGreater('xl');
  const isScreenLg = useGreater('lg');
  const iconSize = isScreenLg ? (isScreenXl ? 22 : 16) : 22;

  return (
    <div className="flex flex-row gap-1 xl:gap-2">
      <a
        href="https://www.youtube.com/@PlanBNetwork"
        target="_blank"
        rel="noreferrer"
      >
        <BsYoutube size={iconSize} className="m-1 text-white" />
      </a>
      <a
        href="https://twitter.com/planb_network"
        target="_blank"
        rel="noreferrer"
      >
        <BsTwitter size={iconSize} className="m-1 text-white" />{' '}
      </a>
      <a
        href="https://www.facebook.com/profile.php?id=61556543067522"
        target="_blank"
        rel="noreferrer"
      >
        <BsFacebook size={iconSize} className="m-1 text-white" />{' '}
      </a>
      <a href="https://discord.gg/CHvZAhJCBh" target="_blank" rel="noreferrer">
        <BsDiscord size={iconSize} className="m-1 text-white" />{' '}
      </a>
      <a
        href="https://github.com/DecouvreBitcoin/sovereign-university-data"
        target="_blank"
        rel="noreferrer"
      >
        <BsGithub size={iconSize} className="m-1 text-white" />{' '}
      </a>
      <a
        href="https://www.linkedin.com/company/planb-network/"
        target="_blank"
        rel="noreferrer"
      >
        <BsLinkedin size={iconSize} className="m-1 text-white" />{' '}
      </a>
      <a href="mailto:contact@planb.network ">
        <AiOutlineMail size={iconSize} className="m-1 text-white" />{' '}
      </a>
    </div>
  );
};

export const Footer = ({ variant = 'light', color }: FooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className="mt-16 md:mt-40 w-full">
      <div
        className={cn(
          'flex w-full flex-col',
          color ?? (variant === 'light' ? 'bg-gray-100' : 'bg-blue-1000'),
        )}
      >
        <div className="relative z-10 flex w-full flex-col bg-orange-500 py-16 md:py-28 md:pl-0">
          <div className="flex flex-row">
            <div className="mr-auto md:mx-auto flex flex-col gap-6 md:gap-20 px-7 md:pl-4 md:flex-row">
              <div className="flex flex-col items-center gap-6 mb-2 md:mb-0 md:hidden lg:flex">
                <img src={PlanBLogo} alt=""></img>
                <div className="hidden lg:block">
                  <SocialNetworks />
                </div>
              </div>
              <div className="flex flex-col md:ml-6">
                <h4 className="mb-2 text-xl font-semibold text-white">
                  {t('words.content')}
                </h4>
                <ul className="flex flex-col space-y-1 text-lg font-light text-white">
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
                <h4 className="mb-2 text-xl font-semibold text-white">
                  {t('words.about')}
                </h4>
                <ul className="flex flex-col space-y-1 text-lg font-light text-white">
                  <li>
                    <Link to={'/manifesto'}>{t('words.ourStory')}</Link>
                  </li>
                  <li>
                    <Link to={'/professors'}>{t('words.professors')}</Link>
                  </li>
                  <li>
                    <Link to={'/node-network'}>{t('words.nodeNetwork')}</Link>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col xl:mr-48">
                <h4 className="mb-2 text-xl font-semibold text-white">
                  {t('words.helpUs')}
                </h4>
                <ul className="flex flex-col space-y-1 text-lg font-light text-white/50">
                  <li>
                    <Link to={'/'}>{t('words.donations')}</Link>
                  </li>
                  <li>
                    <Link to={'/'}>{t('words.merchandising')}</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-4 self-center lg:hidden">
            <SocialNetworks />
          </div>
          <img
            src={OrangePill}
            className="absolute -right-0 bottom-60 hidden h-80 md:-top-32 md:right-0 md:block"
            alt=""
          />
        </div>
      </div>
    </footer>
  );
};
