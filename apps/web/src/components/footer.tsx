import { cn, DividerSimple } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsLinkedin, BsTwitterX, BsYoutube } from 'react-icons/bs';
import Nostr from '#src/assets/icons/nostr.svg?react';
import Rumble from '#src/assets/icons/rumble.svg?react';
import PlanBLogoBlack from '../assets/logo/planb_logo_horizontal_black_orangepill_gradient.svg';
import PlanBLogoWhite from '../assets/logo/planb_logo_horizontal_white_orangepill_gradient.svg';

interface FooterProps {
  variant?: 'light' | 'dark';
}

const SOCIAL_LINKS = [
  {
    href: 'https://twitter.com/planb_network',
    icon: BsTwitterX,
    isReactIcon: true,
    label: 'X',
  },
  {
    href: 'https://www.youtube.com/@PlanBNetwork',
    icon: BsYoutube,
    isReactIcon: true,
    label: 'YouTube',
  },
  {
    href: 'https://github.com/PlanB-Network/bitcoin-educational-content',
    icon: BsGithub,
    isReactIcon: true,
    label: 'Github',
  },
  {
    href: 'https://www.linkedin.com/company/planb-network/',
    icon: BsLinkedin,
    isReactIcon: true,
    label: 'Linkedin',
  },
  {
    href: 'https://rumble.com/user/planb_network',
    icon: Rumble,
    isReactIcon: false,
    label: 'Rumble',
  },
  {
    href: 'https://primal.net/planbnetwork',
    icon: Nostr,
    isReactIcon: false,
    label: 'Nostr',
  },
];

export const Footer = ({ variant = 'light' }: FooterProps) => {
  const { t } = useTranslation();

  const isLight = variant === 'light';
  const backgroundClass =
    variant === 'dark' ? 'bg-white text-newBlack-2' : 'bg-black text-white';
  const textSecondaryClass = isLight ? 'text-newGray-4' : 'text-newBlack-5';
  const logoBottomBgClass = isLight ? 'bg-newBlack-3' : 'bg-newGray-6';

  return (
    <footer className="pt-16 md:pt-24 lg:pt-32 w-full">
      <div className={cn('flex w-full flex-col', backgroundClass)}>
        <div className="flex max-md:flex-col w-full p-4 pb-8 md:py-12 md:px-0 max-md:gap-4">
          <div className="w-full flex max-md:flex-col justify-center gap-6 md:gap-28">
            <NavigationSection
              title={t('words.academy')}
              links={[
                { label: t('words.courses'), to: '/courses' },
                { label: t('words.tutorials'), to: '/tutorials' },
                { label: t('words.resources'), to: '/resources' },
                { label: t('words.professors'), to: '/professors' },
                { label: t('words.bCert'), to: '/b-cert' },
                { label: t('labs.planBLabs'), to: '/plan-b-labs' },
              ]}
              textSecondaryClass={textSecondaryClass}
            />

            <NavigationSection
              title={t('words.network')}
              links={[
                { label: t('words.events'), to: '/events' },
                { label: t('words.nodeNetwork'), to: '/node-network' },
                { label: t('words.public'), to: '/public-communication' },
              ]}
              textSecondaryClass={textSecondaryClass}
            />

            <SocialNetworksDesktop variant={variant} />
          </div>

          <div className="w-full flex flex-col md:hidden gap-4">
            <DividerSimple mode={isLight ? 'dark' : 'light'} />
            <SocialNetworksMobile variant={variant} />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'flex w-full justify-center py-6 md:py-5',
          logoBottomBgClass,
        )}
      >
        <img
          src={isLight ? PlanBLogoWhite : PlanBLogoBlack}
          alt="Logo Plan ₿ Network"
          className="w-26 md:w-30"
        />
      </div>
    </footer>
  );
};

const NavigationSection = ({
  title,
  links,
  textSecondaryClass,
}: {
  title: string;
  links: Array<{ to: string; label: string }>;
  textSecondaryClass: string;
}) => (
  <div className="flex flex-col gap-0.5 md:gap-2">
    <h4 className="body-14px-medium">{title}</h4>
    <ul
      className={cn(
        'flex flex-col gap-1 md:gap-0.5 body-14px capitalize',
        textSecondaryClass,
      )}
    >
      {links.map(({ to, label }) => (
        <li key={to}>
          <Link to={to}>{label}</Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialLink = ({
  href,
  icon: Icon,
  label,
  isReactIcon,
  iconSize,
  iconClasses,
  showLabel = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isReactIcon: boolean;
  iconSize?: number;
  iconClasses: string;
  showLabel?: boolean;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={showLabel ? 'flex items-center gap-2' : ''}
  >
    {isReactIcon ? (
      <Icon size={iconSize} className={iconClasses} />
    ) : (
      <Icon
        className={cn(
          iconSize ? `w-${iconSize / 4} h-${iconSize / 4}` : 'h-3.5',
          'fill-current',
          iconClasses,
        )}
      />
    )}
    {showLabel && <span className="body-14px">{label}</span>}
  </a>
);

const SocialNetworksMobile = ({
  variant,
}: {
  variant: FooterProps['variant'];
}) => {
  const iconSize = 14;
  const iconClasses = cn(
    variant === 'light'
      ? 'text-newGray-4 stroke-newGray-4'
      : 'text-newBlack-5 stroke-newBlack-5',
  );

  return (
    <div className="flex gap-3.5 mx-auto">
      {SOCIAL_LINKS.map(({ href, icon, label, isReactIcon }) => (
        <SocialLink
          key={href}
          href={href}
          icon={icon}
          label={label}
          isReactIcon={isReactIcon}
          iconSize={iconSize}
          iconClasses={iconClasses}
        />
      ))}
    </div>
  );
};

const SocialNetworksDesktop = ({
  variant,
}: {
  variant: FooterProps['variant'];
}) => {
  const { t } = useTranslation();
  const iconSize = 18;
  const iconClasses = cn(
    variant === 'light' ? 'stroke-newGray-4' : 'stroke-newBlack-5',
  );

  return (
    <div className="flex flex-col gap-2 max-md:hidden">
      <h4 className="body-14px-medium">{t('footer.followUsOn')}</h4>
      <ul
        className={cn(
          'flex flex-col gap-0.5 body-14px',
          variant === 'light' ? 'text-newGray-4' : 'text-newBlack-5',
        )}
      >
        {SOCIAL_LINKS.map(({ href, icon, label, isReactIcon }) => (
          <li key={href}>
            <SocialLink
              href={href}
              icon={icon}
              label={label}
              isReactIcon={isReactIcon}
              iconSize={iconSize}
              iconClasses={iconClasses}
              showLabel={true}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
