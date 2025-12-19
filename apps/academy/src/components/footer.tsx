import { cn, DividerSimple } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import { BsGithub, BsLinkedin, BsTwitterX, BsYoutube } from 'react-icons/bs';
import { TbBrandDiscordFilled } from 'react-icons/tb';
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

export const Footer = ({
  showBecomeTeacherButton,
}: {
  showBecomeTeacherButton?: boolean;
}) => {
  const { t } = useTranslation();

  const backgroundClass = 'bg-white text-neutral-900';
  const textSecondaryClass = 'text-neutral-600';

  const links = [
    { label: t('words.aboutUs'), to: '/about' },
    { label: t('words.professors'), to: '/professors' },
    { label: t('labs.planBLabs'), to: '/plan-b-labs' },
    { label: t('words.legal'), to: '/legal' },
  ];

  return (
    <footer className="pt-3 md:pt-6 w-full">
      {/* Desktop */}
      <div className={cn('w-full max-md:hidden', backgroundClass)}>
        {showBecomeTeacherButton && (
          <>
            <div className="flex justify-center py-4.5">
              <BecomeTeacherButton />
            </div>
            <div className="w-full h-6 bg-header" />
          </>
        )}
        <div className="flex w-full flex-col max-w-[1644px] mx-auto px-6">
          <SocialNetworksDesktop />
          <PartPlanBNetwork />
          <DividerSimple />
          <div className="flex items-center py-8 px-2 justify-between gap-4 flex-wrap">
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
      </div>

      {/* Mobile */}
      <div className={cn('flex w-full flex-col md:hidden', backgroundClass)}>
        {showBecomeTeacherButton && (
          <>
            <div className="flex justify-center py-4.5">
              <BecomeTeacherButton />
            </div>
            <div className="w-full h-px bg-header" />
          </>
        )}
        <div className="flex flex-col w-full p-4 pb-0 pt-6 gap-6">
          <div className="w-full flex flex-col justify-center gap-6">
            <img
              src={PlanBLogoBlack}
              alt="Logo Plan ₿ Academy"
              className="w-26.5"
            />
            <NavigationSection
              links={links}
              textSecondaryClass={textSecondaryClass}
            />
          </div>

          <div className="w-full flex flex-col">
            <DividerSimple className="mb-6" />
            <SocialNetworksMobile />
            <PartPlanBNetwork />
          </div>
        </div>
        <div className="flex items-center flex-col gap-1 text-neutral-400 text-center px-2 py-3 border-t border-t-brown-200 body-extra-small">
          <span className="flex items-center gap-1">
            {t('footer.FOSSOpenContent')}
            <a
              href="https://github.com/PlanB-Network/bitcoin-educational-content"
              target="_blank"
              rel="noreferrer"
            >
              <BsGithub size={14} />
            </a>
          </span>
          <span>Plan ₿ Academy • {new Date().getFullYear()}</span>
        </div>
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
          iconClasses={'text-neutral-600 stroke-neutral-600'}
        />
      ))}
    </div>
  );
};

const SocialNetworksDesktop = () => {
  const iconSize = 18;

  return (
    <div className="flex flex-col gap-12 max-md:hidden w-full items-center py-6">
      <ul className={'flex gap-12 text-neutral-600'}>
        {SOCIAL_LINKS.map(({ href, icon, isReactIcon }) => (
          <li key={href}>
            <SocialLink
              href={href}
              icon={icon}
              isReactIcon={isReactIcon}
              iconSize={iconSize}
              iconClasses={'stroke-neutral-600'}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

const PartPlanBNetwork = () => {
  return (
    <p className="flex items-center text-center w-fit mx-auto p-4 md:pt-2 md:px-2 body-extra-small md:body-small text-neutral-400 gap-2 max-md:mt-4">
      <Trans i18nKey="footer.proudlyPartOf">
        <a
          href="https://planb.network/"
          className="text-neutral-600 body-small md:body-small-bold"
          target="_blank"
          rel="noreferrer"
        >
          Plan ₿ Network
        </a>
      </Trans>
    </p>
  );
};

const BecomeTeacherButton = () => {
  return (
    <Link
      to="/become-teacher"
      className="flex items-center p-1 pr-2 bg-neutral-50 border border-neutral-100 rounded-full gap-1 md:gap-2"
    >
      <div className="flex justify-center items-center bg-green-200 rounded-full size-4 md:size-6">
        <span className=" text-green-700 md:body-base-bold max-md:text-[10px] max-md:font-semibold">
          T
        </span>
      </div>
      <span className="body-extra-small text-neutral-500">
        <Trans i18nKey="footer.becomeATeacher">
          <span className="font-semibold">teacher</span>
        </Trans>
      </span>
    </Link>
  );
};
