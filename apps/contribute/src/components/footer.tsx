import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { cn } from '@blms/ui';

import { SocialNetworks } from './social-networks.tsx';

import OrangePill from '../assets/icons/footer_pill.webp?no-inline';
import PlanBLogoWhite from '../assets/logo/planb_logo_horizontal_white_orangepill_gradient.svg';

interface FooterProps {
  variant?: 'light' | 'dark';
  color?: string;
}

export const Footer = ({ variant = 'light', color }: FooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className="w-full">
      {/* Top section */}
      <div
        className={cn(
          'relative flex w-full flex-col border-t border-[#333333]',
          color ??
            (variant === 'dark'
              ? 'bg-white text-black'
              : 'bg-[#1A1A1A] text-white'),
        )}
      >
        <div className="relative mx-auto flex w-full max-w-[1440px] min-h-[181px] flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-16 px-6 pt-14 pb-8 md:pb-[72px]">
          {/* Navigation columns */}
          <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 sm:gap-16">
            <div
              className="flex flex-col gap-2"
              style={{ fontFamily: 'Rubik' }}
            >
              <Link
                to="/"
                className="hover:text-orange-500 text-[14px] leading-[1.43] tracking-[0.17px] font-normal"
              >
                {t('words.home')}
              </Link>
              <Link
                to="/content"
                className="hover:text-orange-500 text-[14px] leading-[1.43] tracking-[0.17px] font-normal"
              >
                {t('footer.contentSections', {
                  defaultValue: 'Content sections',
                })}
              </Link>
            </div>
            <div
              className="flex flex-col gap-2"
              style={{ fontFamily: 'Rubik' }}
            >
              <Link
                to="/my-contributions"
                className="hover:text-orange-500 text-[14px] leading-[1.43] tracking-[0.17px] font-normal"
              >
                {t('footer.myContributions', {
                  defaultValue: 'My contributions',
                })}
              </Link>
              <Link
                to="/help-center"
                className="hover:text-orange-500 text-[14px] leading-[1.43] tracking-[0.17px] font-normal"
              >
                {t('footer.helpCenter', {
                  defaultValue: 'Help center',
                })}
              </Link>
            </div>
          </div>

          {/* Social networks */}
          <div className="flex flex-col items-center md:items-start gap-4 mt-8 md:mt-0">
            <span className="font-bold text-sm md:text-base">Follow us on</span>
            <SocialNetworks variant={variant} />
          </div>

          {/* Decorative Orange pill */}
          <img
            src={OrangePill}
            className="pointer-events-none absolute hidden xl:block -right-[120px] xl:right-[140px] top-1/2 -translate-y-1/2 mt-5 h-24 md:h-48 lg:h-[243px] rotate-55 scale-70 select-none"
            alt="Orange Pill"
          />
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex w-full items-center justify-center bg-[#333333] py-4">
        <img
          src={PlanBLogoWhite}
          alt="Plan ₿ Network logo"
          className="w-[124.5px] h-[23.18px]"
        />
      </div>
    </footer>
  );
};
