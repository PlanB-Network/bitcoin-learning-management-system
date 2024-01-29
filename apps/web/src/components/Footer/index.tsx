import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  BsDiscord,
  BsFacebook,
  BsGithub,
  BsInstagram,
  BsTwitter,
  BsYoutube,
} from 'react-icons/bs';

import { cn } from '@sovereign-university/ui';

import BigTree from '../../assets/footer/big_tree.svg';
import Hill from '../../assets/footer/hill.svg';
import Rabbit from '../../assets/footer/rabbit.svg';
import Tree from '../../assets/footer/tree.svg';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

interface FooterProps {
  variant?: 'light' | 'dark' | 'course';
  color?: string;
}

const Media = ({ className = '', size = 30 }) => (
  <div
    className={cn(
      'flex flex-row place-items-center space-x-6 text-sm text-white',
      className,
    )}
  >
    <a
      href="https://www.youtube.com/@PlanBNetwork"
      target="_blank"
      rel="noopener noreferrer"
    >
      <BsYoutube size={size + 5} />
    </a>
    <a
      href="https://twitter.com/planb_network"
      target="_blank"
      rel="noopener noreferrer"
    >
      <BsTwitter size={size} />
    </a>
    <a
      href="https://facebook.com/decouvreBitcoin"
      target="_blank"
      rel="noopener noreferrer"
    >
      <BsFacebook size={size} />
    </a>
    <a
      href="https://www.instagram.com/rogzy_21M"
      target="_blank"
      rel="noopener noreferrer"
    >
      <BsInstagram size={size} />
    </a>
    <a
      href="https://discord.gg/q9CFPmRNAD"
      target="_blank"
      rel="noopener noreferrer"
    >
      <BsDiscord size={size} />
    </a>
    <a
      href="https://github.com/DecouvreBitcoin"
      target="_blank"
      rel="noopener noreferrer"
    >
      <BsGithub size={size} />
    </a>
  </div>
);

export const Footer = ({ variant = 'light', color }: FooterProps) => {
  const { t } = useTranslation();
  const isScreenMd = useGreater('sm');

  return (
    <footer className="w-full">
      {isScreenMd && (
        <div
          className={cn(
            'flex w-full flex-col pt-10',
            color ?? (variant === 'light' ? 'bg-gray-100' : 'bg-blue-1000'),
          )}
        >
          <div className="relative z-30 -mb-20 h-52"></div>
          <img src={Hill} className="w-full text-clip" alt="" />
          <div className="relative z-10 flex h-80 w-full flex-col justify-center overflow-x-clip bg-green-900">
            <div className="mx-auto mb-10 mt-5 flex w-fit flex-col justify-center space-y-7">
              <div className="grid grid-cols-3 gap-12">
                <div className="flex flex-col">
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
                <div className="flex flex-col pl-12 ">
                  <h4 className="mb-2 text-xl font-semibold text-white">
                    <Link to={''}>{t('words.helpUs')}</Link>
                  </h4>
                  <ul className="flex flex-col space-y-1 text-lg font-light text-white/50">
                    <li>
                      <Link to={''}>{t('words.donations')}</Link>
                    </li>
                    <li>
                      <Link to={''}>{t('words.merchandising')}</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="m-auto flex flex-col">
                <Media />
              </div>
              <div className="m-auto flex flex-row place-items-center space-x-6 text-sm text-white">
                <h4 className="font-semibold text-white">
                  {t('words.termsAndConditions')}
                </h4>
                <a href="/bitcoin.pdf" target="_blank">
                  <h4 className="font-semibold text-white">
                    {t('words.bitcoinWhitepaper')}
                  </h4>
                </a>
              </div>
            </div>
            <img
              src={Rabbit}
              className="absolute -right-2 top-24 z-10 m-auto h-16"
              alt=""
            />
            <img
              src={Tree}
              className="absolute -left-20 -top-44 m-auto h-80 w-[25%] scale-x-[-1]"
              alt=""
            />
            <img
              src={BigTree}
              className="absolute -top-48 right-0 m-auto h-80 w-[25%]"
              alt=""
            />
          </div>
        </div>
      )}
      {!isScreenMd && (
        <div
          className={cn(
            'flex w-full flex-col',
            color ?? (variant === 'light' ? 'bg-gray-100' : 'bg-blue-1000'),
          )}
        >
          <div className="z-0 flex h-[28rem] w-full flex-col items-center justify-start bg-green-900 px-10 pt-20 text-white">
            <div className="mt-6 space-y-2 text-left text-xl">
              <Media className="mb-7 px-1" />
              <h4>
                <Link to={'/'}>{t('words.home')}</Link>
              </h4>
              <h4>
                <Link to={'/manifesto'}>{t('words.about')}</Link>
              </h4>
              <h4 className="text-white/50">{t('words.sponsorUs')}</h4>
              <h5 className="pt-6 text-base font-light text-white/50">
                {t('words.termsAndConditions')}
              </h5>
              <h5 className="pt-2 text-base font-light">
                <a href="/bitcoin.pdf" target="_blank">
                  {t('words.bitcoinWhitepaper')}
                </a>
              </h5>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
