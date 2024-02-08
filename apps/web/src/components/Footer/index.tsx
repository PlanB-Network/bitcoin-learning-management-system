import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import OrangePill from '../../assets/footer_pill.svg';
import PlanBLogo from '../../assets/planb_logo_horizontal_white_blackpill.svg';

interface FooterProps {
  variant?: 'light' | 'dark' | 'course';
  color?: string;
}

export const Footer = ({ variant = 'light', color }: FooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto w-full">
      <div
        className={cn(
          'flex w-full flex-col pt-10',
          color ?? (variant === 'light' ? 'bg-gray-100' : 'bg-blue-1000'),
        )}
      >
        <div className="z-30 -mb-20 h-52"></div>
        <div className="relative z-10 flex w-full flex-col overflow-x-clip bg-orange-500 py-16 pl-6 md:py-28 md:pl-0">
          <div className="flex flex-row space-y-7">
            <div className="mx-auto flex flex-col gap-20 pl-4 pr-60 md:flex-row">
              <div>
                <img
                  src={PlanBLogo}
                  alt=""
                  className="min-w-[150px] md:hidden lg:flex"
                ></img>
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
              <div className="mr-48 flex flex-col">
                <h4 className="mb-2 text-xl font-semibold text-white">
                  {t('words.helpUs')}
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
          </div>
          <img
            src={OrangePill}
            className="absolute -right-24 bottom-60 h-80 md:-top-32 md:right-0"
            alt=""
          />
        </div>
      </div>
    </footer>
  );
};
