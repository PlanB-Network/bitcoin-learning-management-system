import { cn, DividerSimple, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsLinkedin, BsTwitterX, BsYoutube } from 'react-icons/bs';
import { TbBrandDiscordFilled } from 'react-icons/tb';
import Nostr from '#src/assets/icons/nostr.svg?react';
import Rumble from '#src/assets/icons/rumble.svg?react';
import Logo from '#src/assets/logo.svg?no-inline';
import { NetworkButton } from './network-button.tsx';

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
    href: 'https://github.com/PlanB-Network',
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
    href: 'https://discord.gg/q9CFPmRNAD',
    icon: TbBrandDiscordFilled,
    isReactIcon: true,
    label: 'Discord',
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

export const Footer = () => {
  const { t } = useTranslation();

  const backgroundClass = 'bg-footer text-white';
  const textSecondaryClass = 'text-white';

  const mainLinks = [
    { label: t('menu.academy'), to: '/academy' },
    { label: t('menu.hubs'), to: '/hubs' },
    { label: t('menu.funds'), to: '/funds' },
  ];

  const secondaryLinks = [
    { label: t('menu.news'), to: '/news' },
    { label: t('menu.about'), to: '/about' },
    {
      label: t('menu.legal'),
      to: '/legal',
    },
  ];

  return (
    <footer className="mt-25 pt-3 md:pt-6 w-full">
      {/* Desktop */}
      <div
        className={cn(
          'w-full max-md:hidden bg-footer text-white pb-20',
          backgroundClass,
        )}
      >
        <div className="max-w-[1644px] mx-auto px-4">
          <div className="w-full flex flex-row justify-between">
            <Image
              src={Logo}
              alt="Logo Plan ₿ Network"
              className="w-56"
              loading="lazy"
              breakpoints={{ default: 700 }}
            />
            <Link
              to="https://planb.academy"
              target="_blank"
              rel="noopener noreferrer"
              className="self-center"
            >
              <NetworkButton variant={'tertiary'} size={'m'}>
                {t('academy.startLearning')}
              </NetworkButton>
            </Link>
          </div>
          <div className="flex w-full flex-col">
            <div className="flex items-center py-8 justify-between gap-4 flex-wrap">
              <NavigationSection
                mainLinks={mainLinks}
                textSecondaryClass={'text-white'}
              />

              <NavigationSection
                mainLinks={secondaryLinks}
                textSecondaryClass={'text-white'}
              />
            </div>
            <DividerSimple className="bg-brown-500" />
            <SocialNetworksDesktop />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className={cn('flex w-full flex-col md:hidden', backgroundClass)}>
        <div className="flex flex-col w-full p-4 pb-0 pt-6 gap-6">
          <div className="w-full flex flex-col justify-center gap-6">
            <Image
              src={Logo}
              alt="Logo Plan ₿ Network"
              className="w-44"
              loading="lazy"
              breakpoints={{ default: 700 }}
            />
            <div className="flex flex-row justify-between">
              <NavigationSection
                mainLinks={mainLinks}
                textSecondaryClass={textSecondaryClass}
              />
              <NavigationSection
                mainLinks={secondaryLinks}
                textSecondaryClass={'text-white'}
              />
            </div>
          </div>

          <Link
            to="https://planb.academy"
            target="_blank"
            rel="noopener noreferrer"
            className="self-center"
          >
            <NetworkButton variant={'tertiary'}>
              {t('academy.startLearning')}
            </NetworkButton>
          </Link>
          <DividerSimple className="bg-brown-500 mx-auto" />
          <div className="w-full flex flex-col">
            <SocialNetworksMobile />
          </div>
        </div>
      </div>
    </footer>
  );
};

const NavigationSection = ({
  mainLinks,
  textSecondaryClass,
}: {
  mainLinks: Array<{ to: string; label: string }>;
  textSecondaryClass: string;
}) => (
  <div className="flex max-md:flex-col gap-2 md:items-center shrink-0">
    <ul
      className={cn(
        'flex max-md:flex-col gap-3 lg:gap-12 subtitle-base md:title-medium',
        textSecondaryClass,
      )}
    >
      {mainLinks.map(({ to, label }) => (
        <li key={to}>
          <Link to={to} viewTransition>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialLink = ({
  href,
  icon: Icon,
  isReactIcon,
  iconSize,
  iconClasses,
}: {
  href: string;
  icon: React.ElementType;
  isReactIcon: boolean;
  iconSize?: number;
  iconClasses: string;
}) => (
  <a href={href} target="_blank" rel="noreferrer">
    {isReactIcon ? (
      <Icon
        className={cn(iconClasses, iconSize ? `size-${iconSize}` : 'size-4.5')}
      />
    ) : (
      <Icon
        className={cn(
          iconSize ? `size-${iconSize}` : 'size-4.5',
          'fill-current',
          iconClasses,
        )}
      />
    )}
  </a>
);

const SocialNetworksMobile = () => {
  const iconSize = 18;

  return (
    <div className="flex gap-5 mx-auto mb-6">
      {SOCIAL_LINKS.map(({ href, icon, isReactIcon }) => (
        <SocialLink
          key={href}
          href={href}
          icon={icon}
          isReactIcon={isReactIcon}
          iconSize={iconSize}
          iconClasses={'stroke-brown-100'}
        />
      ))}
    </div>
  );
};

const SocialNetworksDesktop = () => {
  return (
    <div className="flex flex-col gap-12 max-md:hidden w-full items-center py-6">
      <ul className={'flex gap-12 text-brown-100'}>
        {SOCIAL_LINKS.map(({ href, icon, isReactIcon }) => (
          <li key={href}>
            <SocialLink
              href={href}
              icon={icon}
              isReactIcon={isReactIcon}
              iconSize={7}
              iconClasses={'stroke-brown-100'}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
