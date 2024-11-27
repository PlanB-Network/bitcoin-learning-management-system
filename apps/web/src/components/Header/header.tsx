import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@blms/ui';

import resourcesSvg from '#src/assets/resources/builder.svg';
import eventsSvg from '#src/assets/resources/conference.svg';
import glossarySvg from '#src/assets/resources/glossary.svg';
import coursesSvg from '#src/assets/resources/library.svg';
import podcastSvg from '#src/assets/resources/podcast.svg';
import tutorialsSvg from '#src/assets/resources/toolkit.svg';
import aboutSvg from '#src/assets/resources/world.svg';
import { useGreater } from '#src/hooks/use-greater.js';

import bitcoinSvg from '../../assets/icons/bitcoin.svg';
import businessSvg from '../../assets/icons/business.svg';
import protocolSvg from '../../assets/icons/protocol.svg';
import securitySvg from '../../assets/icons/security.svg';
import socialStudiesSvg from '../../assets/icons/world-pixelated.svg';
import miningSvg from '../../assets/tutorials/mining.svg';
import { useDisclosure } from '../../hooks/use-disclosure.ts';
import { TUTORIALS_CATEGORIES } from '../../utils/tutorials.ts';
import { AuthModal } from '../AuthModals/auth-modal.tsx';
import { AuthModalState } from '../AuthModals/props.ts';

import { FlyingMenu } from './FlyingMenu/flying-menu.tsx';
import { MobileMenu } from './MobileMenu/mobile-menu.tsx';
import type { NavigationSection } from './props.ts';

interface HeaderProps {
  variant?: 'light' | 'dark';
}

export const Header = ({ variant = 'dark' }: HeaderProps) => {
  const { t } = useTranslation();

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  // Todo change this when better auth flow is implemented (this is awful)
  const [authMode, setAuthMode] = useState<AuthModalState>(
    AuthModalState.SignIn,
  );

  // Todo, refactor desktop/mobile duplication
  const desktopSections: NavigationSection[] = [
    {
      id: 'courses',
      title: t('words.courses'),
      path: '/courses',
      items: [
        {
          id: 'courses-left',
          items: [
            {
              id: 'courses-bitcoin',
              title: t('words.bitcoin'),
              icon: bitcoinSvg,
              description: t('menu.bitcoinDescription'),
              path: '/courses#bitcoin',
            },
            {
              id: 'courses-business',
              title: t('words.business'),
              icon: businessSvg,
              description: t('menu.businessDescription'),
              path: '/courses#business',
            },
            {
              id: 'courses-mining',
              title: t('words.mining'),
              icon: miningSvg,
              description: t('menu.miningCourseDescription'),
              path: '/courses#mining',
            },
          ],
        },
        {
          id: 'courses-right',
          items: [
            {
              id: 'courses-protocol',
              title: t('words.protocol'),
              icon: protocolSvg,
              description: t('menu.protocolDescription'),
              path: '/courses#protocol',
            },
            {
              id: 'courses-security',
              title: t('words.security'),
              icon: securitySvg,
              description: t('menu.securityDescription'),
              path: '/courses#security',
            },
            {
              id: 'courses-social-studies',
              title: t('words.socialStudies'),
              icon: socialStudiesSvg,
              description: t('menu.socialStudiesDescription'),
              path: '/courses#social%20studies',
            },
          ],
        },
      ],
    },
    {
      id: 'events',
      title: t('words.events'),
      path: '/events',
    },
    {
      id: 'resources',
      title: t('words.resources'),
      path: '/resources',
      items: [
        {
          id: 'resources-nested',
          items: [
            {
              id: 'library',
              title: t('words.library'),
              icon: coursesSvg,
              description: t('menu.libraryDescription'),
              path: '/resources/books',
            },
            {
              id: 'podcasts',
              title: t('words.podcasts'),
              description: t('menu.podcastsDescription'),
              path: '/resources/podcasts',
              icon: podcastSvg,
            },
            {
              id: 'conferences',
              title: t('conferences.pageTitle'),
              description: t('menu.conferencesDescription'),
              path: '/resources/conferences',
              icon: eventsSvg,
            },
            {
              id: 'builders',
              title: t('words.builders'),
              description: t('menu.buildersDescription'),
              path: '/resources/builders',
              icon: resourcesSvg,
            },
            {
              id: 'glossary',
              title: t('words.glossary'),
              description: t('menu.glossaryDescription'),
              path: '/resources/glossary',
              icon: glossarySvg,
            },
            {
              id: 'bet',
              title: t('bet.pageTitle'),
              description: t('menu.betDescription'),
              path: '/resources/bet',
              icon: tutorialsSvg,
            },
            {
              id: 'newsletter',
              title: t('resources.newsletters.title'),
              description: t('menu.newsletterDescription'),
              path: '/resources/newsletters',
              icon: socialStudiesSvg,
            },
          ],
        },
      ],
    },
    {
      id: 'tutorials',
      title: t('words.tutorials'),
      path: '/tutorials',
      items: [
        {
          id: 'tutorial-nested',
          items: TUTORIALS_CATEGORIES.map((category) => ({
            id: category.name,
            title: t(`tutorials.${category.name}.title`),
            path: category.route,
            description: t(`tutorials.${category.name}.shortDescription`),
            icon: category.icon,
          })),
        },
      ],
    },
    {
      id: 'about-us',
      title: t('words.about'),
      path: '/about',
      items: [
        {
          id: 'about-us-nested',
          items: [
            {
              id: 'professors',
              title: t('words.professors'),
              description: t('menu.teachersDescription'),
              path: '/professors',
            },
            {
              id: 'node-network',
              title: t('words.nodeNetwork'),
              description: t('menu.nodeNetworkDescription'),
              path: '/node-network',
            },
            {
              id: 'b-certificate',
              title: t('words.bCertificate'),
              description: t('menu.bCertificateDescription'),
              path: '/b-certificate',
            },
            {
              id: 'public-release',
              title: t('words.public'),
              description: t('menu.publicDescription'),
              path: '/public-communication',
            },
          ],
        },
      ],
    },
  ];

  const mobileSections: NavigationSection[] = [
    {
      id: 'courses',
      title: t('words.courses'),
      path: '/courses',
      mobileIcon: coursesSvg,
    },
    {
      id: 'events',
      title: t('words.events'),
      path: '/events',
      mobileIcon: eventsSvg,
    },
    {
      id: 'resources',
      title: t('words.resources'),
      path: '/resources',
      mobileIcon: resourcesSvg,
    },
    {
      id: 'tutorials',
      title: t('words.tutorials'),
      path: '/tutorials',
      mobileIcon: tutorialsSvg,
    },
    {
      id: 'about-us',
      title: t('words.about'),
      path: '/about',
      mobileIcon: aboutSvg,
    },
  ];

  const isScreenLg = useGreater('lg');

  return (
    <header
      className={cn(
        'sticky left-0 top-0 z-20 flex w-full flex-row justify-between p-3 px-4 lg:min-h-[96px] lg:px-12',
        variant === 'light' ? 'bg-darkOrange-5' : 'bg-headerDark',
      )}
    >
      {isScreenLg ? (
        <FlyingMenu
          onClickLogin={() => {
            setAuthMode(AuthModalState.SignIn);
            openAuthModal();
          }}
          onClickRegister={() => {
            setAuthMode(AuthModalState.Register);
            openAuthModal();
          }}
          sections={desktopSections}
          variant={variant}
        />
      ) : (
        <MobileMenu
          onClickLogin={() => {
            setAuthMode(AuthModalState.SignIn);
            openAuthModal();
          }}
          sections={[...mobileSections]}
          variant={variant}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialState={authMode}
          redirectTo={'/dashboard/courses'}
        />
      )}
    </header>
  );
};
