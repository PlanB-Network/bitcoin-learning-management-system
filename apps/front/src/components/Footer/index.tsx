import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';
import {
  BsDiscord,
  BsFacebook,
  BsInstagram,
  BsTwitter,
  BsYoutube,
} from 'react-icons/bs';

import { ReactComponent as BackRabbit } from '../../assets/footer/back_rabbit.svg';
import { ReactComponent as BackRabbit2 } from '../../assets/footer/back_rabbit_2.svg';
import { ReactComponent as BigTree } from '../../assets/footer/big_tree.svg';
import { ReactComponent as City } from '../../assets/footer/city.svg';
import { ReactComponent as Cloud } from '../../assets/footer/cloud.svg';
import { ReactComponent as Hill } from '../../assets/footer/hill.svg';
import { ReactComponent as Rabbit } from '../../assets/footer/rabbit.svg';
import { ReactComponent as Tree } from '../../assets/footer/tree.svg';
import { compose } from '../../utils';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

interface FooterProps {
  variant?: 'light' | 'dark' | 'course';
  color?: string;
}

const Media = ({ className = '', size = 30 }) => (
  <div
    className={compose(
      'flex flex-row place-items-center space-x-6 text-sm',
      className
    )}
  >
    <BsYoutube size={size + 5} />
    <BsTwitter size={size} />
    <BsFacebook size={size} />
    <BsInstagram size={size} />
    <BsDiscord size={size} />
  </div>
);

export const Footer = ({ variant = 'light', color }: FooterProps) => {
  const { t } = useTranslation();
  const isScreenMd = useGreater('sm');

  return (
    <footer className="w-full">
      {isScreenMd && (
        <div
          className={compose(
            'relative flex w-full flex-col pt-10',
            color ?? (variant === 'light' ? 'bg-gray-100' : 'bg-primary-900')
          )}
        >
          <div
            className={compose(
              'relative flex w-full flex-col pt-10',
              color ?? (variant === 'light' ? 'bg-gray-100' : 'bg-primary-900')
            )}
          >
            <City className="z-10 m-auto mb-6 h-fit w-1/2 self-end" />
            <Hill className="absolute bottom-0  w-full text-clip" />
            <Cloud
              className={compose(
                'absolute m-auto left-20 top-20 w-32',
                variant === 'light' ? 'text-gray-200' : 'text-gray-300'
              )}
            />
          </div>
          <div className="relative z-10 flex h-96 w-full flex-col justify-center bg-green-800">
            <div className="mx-auto mb-10 mt-5 flex w-fit flex-col justify-center space-y-7">
              <div className="flex flex-row space-x-10">
                <div className="flex flex-col">
                  <h4 className="mb-2 text-base font-semibold text-white">
                    {t('words.content')}
                  </h4>
                  <ul className="flex flex-col space-y-1 text-sm font-thin text-white">
                    <li>{t('words.courses')}</li>
                    <li>{t('words.resources')}</li>
                    <li>{t('words.tutorials')}</li>
                  </ul>
                </div>
                <div className="flex flex-col">
                  <h4 className="mb-2 text-base font-semibold text-white">
                    {t('words.about')}
                  </h4>
                  <ul className="flex flex-col space-y-1 text-sm font-thin text-white">
                    <li>{t('words.ourStory')}</li>
                    <li>{t('words.sponsoringAndContributors')}</li>
                    <li>{t('words.Teachers')}</li>
                  </ul>
                </div>
                <div className="flex flex-col">
                  <h4 className="mb-2 text-base font-semibold text-white">
                    {t('words.helpUs')}
                  </h4>
                  <ul className="flex flex-col space-y-1 text-sm font-thin text-white">
                    <li>{t('words.donations')}</li>
                    <li>{t('words.merchandising')}</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col">
                <h4 className="mb-2 text-base font-semibold text-white">
                  {t('words.followUs')}
                </h4>
                <div className="flex flex-row place-items-center space-x-6 text-sm text-white">
                  <BsYoutube size={35} />
                  <BsTwitter size={30} />
                  <BsFacebook size={30} />
                  <BsInstagram size={30} />
                  <BsDiscord size={30} />
                </div>
              </div>
              <h4 className="text-xs font-semibold text-white">
                {t('words.termsAndConditions')}
              </h4>
            </div>
            <Rabbit className="absolute -right-2 top-24 z-10 m-auto h-16" />
            <Tree className="absolute -left-20 -top-44 m-auto h-80 w-[25%] scale-x-[-1]" />
            <Tree className="absolute -top-16 right-0 z-10 m-auto h-80 w-[25%]" />
            <BigTree className="absolute -top-48 right-0 m-auto h-80 w-[25%]" />
            <div className="flex w-full flex-row justify-center space-x-3 self-center overflow-hidden pb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-row space-x-3">
                  <BackRabbit className="h-20 w-fit" />
                  <BackRabbit2 className="h-20 w-fit" />
                  <BackRabbit className="h-20 w-fit scale-x-[-1]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {!isScreenMd && (
        <div
          className={compose(
            'relative flex w-full flex-col pt-10',
            color ?? (variant === 'light' ? 'bg-gray-100' : 'bg-primary-900')
          )}
        >
          <Cloud
            className={compose(
              'absolute left-16 top-10 w-20',
              variant === 'light' ? 'text-gray-200' : 'text-gray-300'
            )}
          />
          <City className="relative z-10 -mb-5 h-fit w-full " />
          <div className="z-0 flex h-96 w-full flex-col items-center justify-start bg-green-800 px-10 pt-20 text-white">
            <div className="space-y-2 text-left text-xl">
              <Media className="mb-7 px-1" size={40} />
              <h4>{t('words.home')}</h4>
              <h4>{t('words.about')}</h4>
              <h4>{t('words.sponsorUs')}</h4>
              <h5 className="pt-6 text-base font-thin">
                {t('words.termsAndConditions')}
              </h5>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
