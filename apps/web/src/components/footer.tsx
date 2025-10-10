import { cn, DividerSimple } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsLinkedin, BsTwitterX, BsYoutube } from 'react-icons/bs';
import Nostr from '#src/assets/icons/nostr.svg?react';
import Rumble from '#src/assets/icons/rumble.svg?react';
import PlanBLogoBlack from '../assets/logo/planb_logo_horizontal_black.svg';

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

export const Footer = () => {
  const { t } = useTranslation();

  const backgroundClass = 'bg-white text-newBlack-2';
  const textSecondaryClass = 'text-newBlack-5';

  const links = [
    { label: t('words.aboutUs'), to: '/about' },
    { label: t('words.professors'), to: '/professors' },
    { label: t('words.planBNetwork'), to: 'https://planb.network' },
    { label: t('labs.planBLabs'), to: '/plan-b-labs' },
  ];

  return (
    <footer className="pt-3 md:pt-6 w-full">
      {/* Desktop */}
      <div
        className={cn(
          'flex w-full flex-col max-md:hidden px-6',
          backgroundClass,
        )}
      >
        <SocialNetworksDesktop />
        <DividerSimple mode={'light'} />
        <div className="flex items-center py-4 px-2 justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5 text-neutral-400">
            <span className="body-small truncate">
              Plan ₿ Academy • {new Date().getFullYear()} –{' '}
              {t('footer.FOSSOpenContent')}
            </span>
            <a
              href="https://github.com/PlanB-Network/bitcoin-educational-content"
              target="_blank"
              rel="noreferrer"
            >
              <BsGithub size={14} />
            </a>
          </div>
          <NavigationSection
            links={links}
            textSecondaryClass={'text-neutral-400'}
          />
        </div>
      </div>

      {/* Mobile */}
      <div className={cn('flex w-full flex-col md:hidden', backgroundClass)}>
        <div className="flex flex-col w-full p-4 pt-6 pb-8 gap-6">
          <div className="w-full flex flex-col justify-center gap-6">
            <NavigationSection
              title={t('words.academy')}
              links={links}
              textSecondaryClass={textSecondaryClass}
            />
          </div>

          <div className="w-full flex flex-col gap-4">
            <DividerSimple mode={'light'} />
            <SocialNetworksMobile />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'flex w-full justify-center py-6 md:hidden',
          backgroundClass,
        )}
      >
        <img src={PlanBLogoBlack} alt="Logo Plan ₿ Academy" className="w-26" />
      </div>
    </footer>
  );
};

const NavigationSection = ({
  title,
  links,
  textSecondaryClass,
}: {
  title?: string;
  links: Array<{ to: string; label: string }>;
  textSecondaryClass: string;
}) => (
  <div className="flex max-md:flex-col gap-2 md:items-center shrink-0">
    {title && <h4 className="body-medium-16px">{title}</h4>}
    <ul
      className={cn(
        'flex max-md:flex-col gap-3 xl:gap-7 body-16px md:body-small',
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
        className={cn(iconClasses, iconSize ? `h-${iconSize / 4}` : 'h-4.5')}
      />
    ) : (
      <Icon
        className={cn(
          iconSize ? `h-${iconSize / 4}` : 'h-4.5',
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
    <div className="flex gap-5 mx-auto">
      {SOCIAL_LINKS.map(({ href, icon, isReactIcon }) => (
        <SocialLink
          key={href}
          href={href}
          icon={icon}
          isReactIcon={isReactIcon}
          iconSize={iconSize}
          iconClasses={'text-newBlack-5 stroke-newBlack-5'}
        />
      ))}
    </div>
  );
};

const SocialNetworksDesktop = () => {
  const iconSize = 18;

  return (
    <div className="flex flex-col gap-12 max-md:hidden w-full items-center py-6">
      <ul className={'flex gap-12 text-newBlack-5'}>
        {SOCIAL_LINKS.map(({ href, icon, isReactIcon }) => (
          <li key={href}>
            <SocialLink
              href={href}
              icon={icon}
              isReactIcon={isReactIcon}
              iconSize={iconSize}
              iconClasses={'stroke-newBlack-5'}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
