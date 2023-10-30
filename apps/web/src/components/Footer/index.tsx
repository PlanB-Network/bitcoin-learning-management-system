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

import BackRabbit from '../../assets/footer/back_rabbit.svg';
import BackRabbit2 from '../../assets/footer/back_rabbit_2.svg';
import BigTree from '../../assets/footer/big_tree.svg';
import City from '../../assets/footer/city.svg';
import Cloud from '../../assets/footer/cloud.svg?react';
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
            'relative flex w-full flex-col pt-10',
            color ?? (variant === 'light' ? 'bg-gray-100' : 'bg-blue-1000'),
          )}
        >
          <div
            className={cn(
              'relative flex w-full flex-col pt-10',
              color ?? (variant === 'light' ? 'bg-gray-100' : 'bg-blue-1000'),
            )}
          >
            <img
              src={City}
              className="z-10 m-auto mb-6 h-fit w-1/2 self-end"
              alt=""
            />
            <img
              src={Hill}
              className="absolute bottom-0  w-full text-clip"
              alt=""
            />
            <Cloud
              className={cn(
                'absolute m-auto left-20 top-20 w-32',
                variant === 'light' ? 'text-gray-200' : 'text-gray-300',
              )}
            />
          </div>
          <div className="relative z-10 flex h-96 w-full flex-col justify-center overflow-x-clip bg-green-900">
            <div className="mx-auto mb-10 mt-5 flex w-fit flex-col justify-center space-y-7">
              <div className="flex flex-row space-x-10">
                <div className="flex flex-col">
                  <h4 className="mb-2 text-base font-semibold text-white">
                    {t('words.content')}
                  </h4>
                  <ul className="flex flex-col space-y-1 text-sm font-light text-white">
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
                  <h4 className="mb-2 text-base font-semibold text-white">
                    {t('words.about')}
                  </h4>
                  <ul className="flex flex-col space-y-1 text-sm font-light text-white">
                    <li>
                      <Link to={''} className="text-white/50">
                        {t('words.ourStory')}
                      </Link>
                    </li>
                    <li>
                      <Link to={''} className="text-white/50">
                        {t('words.sponsoringAndContributors')}
                      </Link>
                    </li>
                    <li>
                      <Link to={'/professors'}>{t('words.professors')}</Link>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col">
                  <h4 className="mb-2 text-base font-semibold text-white">
                    <Link to={''}>{t('words.helpUs')}</Link>
                  </h4>
                  <ul className="flex flex-col space-y-1 text-sm font-light text-white/50">
                    <li>
                      <Link to={''}>{t('words.donations')}</Link>
                    </li>
                    <li>
                      <Link to={''}>{t('words.merchandising')}</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col">
                <h4 className="mb-2 text-base font-semibold text-white">
                  {t('words.followUs')}
                </h4>
                <Media />
              </div>
              <div className="flex flex-row place-items-center space-x-6 text-sm text-white">
                <h4 className="text-xs font-semibold text-white">
                  {t('words.termsAndConditions')}
                </h4>
                <a href="/bitcoin.pdf" target="_blank">
                  <h4 className="text-xs font-semibold text-white">
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
              src={Tree}
              className="absolute -top-16 right-0 z-10 m-auto h-80 w-[25%]"
              alt=""
            />
            <img
              src={BigTree}
              className="absolute -top-48 right-0 m-auto h-80 w-[25%]"
              alt=""
            />
            <div className="flex w-full flex-row justify-center space-x-3 self-center overflow-hidden pb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-row space-x-3">
                  <img src={BackRabbit} className="h-20 w-fit" alt="" />
                  <img src={BackRabbit2} className="h-20 w-fit" alt="" />
                  <img
                    src={BackRabbit}
                    className="h-20 w-fit scale-x-[-1]"
                    alt=""
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {!isScreenMd && (
        <div
          className={cn(
            'relative flex w-full flex-col pt-10',
            color ?? (variant === 'light' ? 'bg-gray-100' : 'bg-blue-1000'),
          )}
        >
          <Cloud
            className={cn(
              'absolute left-16 top-10 w-20',
              variant === 'light' ? 'text-gray-200' : 'text-gray-300',
            )}
          />
          <img
            src={City}
            className="relative z-10 -mb-5 h-fit w-full "
            alt=""
          />
          <div className="z-0 flex h-96 w-full flex-col items-center justify-start bg-green-900 px-10 pt-20 text-white">
            <div className="space-y-2 text-left text-xl">
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
