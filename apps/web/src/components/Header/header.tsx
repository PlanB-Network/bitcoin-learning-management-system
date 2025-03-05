import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuMessageSquareMore } from 'react-icons/lu';
import { MdOutlineSchool, MdPeopleAlt } from 'react-icons/md';
import { TbWorld } from 'react-icons/tb';

import { cn } from '@blms/ui';

import profileLogInBlack from '#src/assets/icons/profile_log_in_black.svg';
import profileLogInWhite from '#src/assets/icons/profile_log_in_white.svg';
import searchMobileSvg from '#src/assets/icons/search-mobile.svg';
import eventsSvg from '#src/assets/resources/conference.svg';
import glossarySvg from '#src/assets/resources/glossary.svg';
import lecturesSvg from '#src/assets/resources/lecture.svg';
import coursesSvg from '#src/assets/resources/library.svg';
import moviesSvg from '#src/assets/resources/movie.svg';
import podcastSvg from '#src/assets/resources/podcast.svg';
import projectSvg from '#src/assets/resources/project.svg';
import tutorialsSvg from '#src/assets/resources/toolkit.svg';
import aboutSvg from '#src/assets/resources/world.svg';
import youtubeChannelsSvg from '#src/assets/resources/youtube.svg';

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

import { RiFlaskLine } from 'react-icons/ri';
import { AppContext } from '#src/providers/context.js';
import { isTestnetOrDevelopmentEnvironment } from '#src/utils/misc.ts';
import { FlyingMenu } from './FlyingMenu/flying-menu.tsx';
import { MobileMenu } from './MobileMenu/mobile-menu.tsx';
import type { NavigationSection, NavigationSectionMobile } from './props.ts';

interface HeaderProps {
  variant?: 'light' | 'dark';
}

export const Header = ({ variant = 'dark' }: HeaderProps) => {
  const { t } = useTranslation();
  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    useDisclosure();
  const { isOpen: isMobileDashboardMenuOpen, toggle: toggleDashboardMenu } =
    useDisclosure();

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
              path: '/courses',
              search: {
                topics: 'bitcoin',
              },
            },
            {
              id: 'courses-business',
              title: t('words.business'),
              icon: businessSvg,
              description: t('menu.businessDescription'),
              path: '/courses',
              search: {
                topics: 'business',
              },
            },
            {
              id: 'courses-mining',
              title: t('words.mining'),
              icon: miningSvg,
              description: t('menu.miningCourseDescription'),
              path: '/courses',
              search: {
                topics: 'mining',
              },
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
              path: '/courses',
              search: {
                topics: 'protocol',
              },
            },
            {
              id: 'courses-security',
              title: t('words.security'),
              icon: securitySvg,
              description: t('menu.securityDescription'),
              path: '/courses',
              search: {
                topics: 'security',
              },
            },
            {
              id: 'courses-social-studies',
              title: t('words.socialStudies'),
              icon: socialStudiesSvg,
              description: t('menu.socialStudiesDescription'),
              path: '/courses',
              search: {
                topics: 'social studies',
              },
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
          id: 'resources-left',
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
              id: 'projects',
              title: t('words.projects'),
              description: t('menu.projectsDescription'),
              path: '/resources/projects',
              icon: projectSvg,
            },
            {
              id: 'bet',
              title: t('bet.pageTitle'),
              description: t('menu.betDescription'),
              path: '/resources/bet',
              icon: tutorialsSvg,
            },
          ],
        },
        {
          id: 'resources-right',
          items: [
            {
              id: 'glossary',
              title: t('words.glossary'),
              description: t('menu.glossaryDescription'),
              path: '/resources/glossary',
              icon: glossarySvg,
            },
            {
              id: 'newsletter',
              title: t('resources.newsletters.title'),
              description: t('menu.newsletterDescription'),
              path: '/resources/newsletters',
              icon: socialStudiesSvg,
            },
            {
              id: 'channels',
              title: t('resources.channels.title'),
              description: t('menu.channelsDescription'),
              path: '/resources/channels',
              icon: youtubeChannelsSvg,
            },
            {
              id: 'lectures',
              title: t('resources.lectures.title'),
              description: t('menu.lecturesDescription'),
              path: '/resources/lectures',
              icon: lecturesSvg,
            },
            {
              id: 'movies',
              title: t('resources.movies.title'),
              description: t('menu.moviesDescription'),
              path: '/resources/movies',
              icon: moviesSvg,
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
              id: 'b-cert',
              title: t('words.bCert'),
              description: t('menu.bCertDescription'),
              path: '/b-cert',
            },
            ...(isTestnetOrDevelopmentEnvironment()
              ? [
                  {
                    id: 'plan-b-labs',
                    title: t('labs.planBLabs'),
                    description: t('menu.planBLabsDescription'),
                    path: '/plan-b-labs',
                  },
                ]
              : []),
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

  const mobileSections: NavigationSectionMobile[] = [
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
      mobileIcon: projectSvg,
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
      mobileIcon: aboutSvg,
      items: [
        {
          id: 'professors',
          title: t('words.professors'),
          description: t('menu.teachersDescription'),
          path: '/professors',
          icon: <MdPeopleAlt size={20} className="shrink-0" />,
        },
        {
          id: 'node-network',
          title: t('words.nodeNetwork'),
          description: t('menu.nodeNetworkDescription'),
          path: '/node-network',
          icon: <TbWorld size={20} className="shrink-0" />,
        },
        {
          id: 'b-cert',
          title: t('words.bCert'),
          description: t('menu.bCertDescription'),
          path: '/b-cert',
          icon: <MdOutlineSchool size={20} className="shrink-0" />,
        },
        ...(isTestnetOrDevelopmentEnvironment()
          ? [
              {
                id: 'plan-b-labs',
                title: t('labs.planBLabs'),
                description: t('menu.planBLabsDescription'),
                path: '/plan-b-labs',
                icon: <RiFlaskLine size={20} className="shrink-0" />,
              },
            ]
          : []),
        {
          id: 'public-release',
          title: t('words.public'),
          description: t('menu.publicDescription'),
          path: '/public-communication',
          icon: <LuMessageSquareMore size={20} className="shrink-0" />,
        },
      ],
    },
    isLoggedIn
      ? {
          id: 'dashboard',
          title: t('dashboard.studentDashboard'),
          action: () => {
            toggleDashboardMenu();
            toggleMobileMenu();
          },
          mobileIcon:
            variant === 'light' ? profileLogInBlack : profileLogInWhite,
          removeFilterOnIcon: true,
        }
      : {
          id: 'login',
          title: t('menu.login'),
          action: () => {
            setAuthMode(AuthModalState.SignIn);
            openAuthModal();
            toggleMobileMenu();
          },
          mobileIcon:
            variant === 'light' ? profileLogInBlack : profileLogInWhite,
          removeFilterOnIcon: true,
        },
    {
      id: 'search',
      title: t('words.search'),
      path: '/search',
      mobileIcon: searchMobileSvg,
    },
  ];

  return (
    <header
      className={cn(
        'sticky left-0 top-0 z-40 flex w-full flex-row justify-between py-[11px] px-4 lg:min-h-[96px] lg:px-12 lg:py-3',
        variant === 'light' ? 'bg-darkOrange-5' : 'bg-headerDark',
      )}
    >
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

      <MobileMenu
        onClickLogin={() => {
          setAuthMode(AuthModalState.SignIn);
          openAuthModal();
        }}
        sections={[...mobileSections]}
        variant={variant}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        isMobileDashboardMenuOpen={isMobileDashboardMenuOpen}
        toggleDashboardMenu={toggleDashboardMenu}
      />

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
