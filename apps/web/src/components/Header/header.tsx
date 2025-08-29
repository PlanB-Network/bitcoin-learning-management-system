import { cn } from '@blms/ui';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuMessageSquareMore } from 'react-icons/lu';
import { MdOutlineSchool, MdPeopleAlt } from 'react-icons/md';
import { RiFlaskLine } from 'react-icons/ri';
import { TbWorld } from 'react-icons/tb';
import miningSvg from '#src/assets/courses/mining.svg';
import bitcoinSvg from '#src/assets/icons/bitcoin.svg';
import businessSvg from '#src/assets/icons/business.svg';
import profileLogInWhite from '#src/assets/icons/profile_log_in_white.svg';
import protocolSvg from '#src/assets/icons/protocol.svg';
import searchMobileSvg from '#src/assets/icons/search-mobile.svg';
import securitySvg from '#src/assets/icons/security.svg';
import socialStudiesSvg from '#src/assets/icons/world-pixelated.svg';
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
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { AppContext } from '#src/providers/context.js';
import { TUTORIALS_CATEGORIES } from '#src/services/utils.tsx';
import { AuthModal } from '../AuthModals/auth-modal.tsx';
import { AuthModalState } from '../AuthModals/props.ts';
import { FlyingMenu } from './FlyingMenu/flying-menu.tsx';
import { MobileMenu } from './MobileMenu/mobile-menu.tsx';
import type { NavigationSection, NavigationSectionMobile } from './props.ts';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const Header = ({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) => {
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
      items: [
        {
          id: 'courses-left',
          items: [
            {
              description: t('menu.bitcoinDescription'),
              icon: bitcoinSvg,
              id: 'courses-bitcoin',
              path: '/courses',
              search: {
                topics: 'bitcoin',
              },
              title: t('words.bitcoin'),
            },
            {
              description: t('menu.businessDescription'),
              icon: businessSvg,
              id: 'courses-business',
              path: '/courses',
              search: {
                topics: 'business',
              },
              title: t('words.business'),
            },
            {
              description: t('menu.miningCourseDescription'),
              icon: miningSvg,
              id: 'courses-mining',
              path: '/courses',
              search: {
                topics: 'mining',
              },
              title: t('words.mining'),
            },
          ],
        },
        {
          id: 'courses-right',
          items: [
            {
              description: t('menu.protocolDescription'),
              icon: protocolSvg,
              id: 'courses-protocol',
              path: '/courses',
              search: {
                topics: 'protocol',
              },
              title: t('words.protocol'),
            },
            {
              description: t('menu.securityDescription'),
              icon: securitySvg,
              id: 'courses-security',
              path: '/courses',
              search: {
                topics: 'security',
              },
              title: t('words.security'),
            },
            {
              description: t('menu.socialStudiesDescription'),
              icon: socialStudiesSvg,
              id: 'courses-social-studies',
              path: '/courses',
              search: {
                topics: 'social studies',
              },
              title: t('words.socialStudies'),
            },
          ],
        },
      ],
      path: '/courses',
      title: t('words.courses'),
    },
    {
      id: 'events',
      path: '/events',
      title: t('words.events'),
    },
    {
      id: 'resources',
      items: [
        {
          id: 'resources-left',
          items: [
            {
              description: t('menu.libraryDescription'),
              icon: coursesSvg,
              id: 'library',
              path: '/resources/books',
              title: t('words.library'),
            },
            {
              description: t('menu.podcastsDescription'),
              icon: podcastSvg,
              id: 'podcasts',
              path: '/resources/podcasts',
              title: t('words.podcasts'),
            },
            {
              description: t('menu.conferencesDescription'),
              icon: eventsSvg,
              id: 'conferences',
              path: '/resources/conferences',
              title: t('conferences.pageTitle'),
            },
            {
              description: t('menu.projectsDescription'),
              icon: projectSvg,
              id: 'projects',
              path: '/resources/projects',
              title: t('words.projects'),
            },
            {
              description: t('menu.betDescription'),
              icon: tutorialsSvg,
              id: 'bet',
              path: '/resources/bet',
              title: t('bet.pageTitle'),
            },
          ],
        },
        {
          id: 'resources-right',
          items: [
            {
              description: t('menu.glossaryDescription'),
              icon: glossarySvg,
              id: 'glossary',
              path: '/resources/glossary',
              title: t('words.glossary'),
            },
            {
              description: t('menu.newsletterDescription'),
              icon: socialStudiesSvg,
              id: 'newsletter',
              path: '/resources/newsletters',
              title: t('resources.newsletters.title'),
            },
            {
              description: t('menu.channelsDescription'),
              icon: youtubeChannelsSvg,
              id: 'channels',
              path: '/resources/channels',
              title: t('resources.channels.title'),
            },
            {
              description: t('menu.lecturesDescription'),
              icon: lecturesSvg,
              id: 'lectures',
              path: '/resources/lectures',
              title: t('resources.lectures.title'),
            },
            {
              description: t('menu.moviesDescription'),
              icon: moviesSvg,
              id: 'movies',
              path: '/resources/movies',
              title: t('resources.movies.title'),
            },
          ],
        },
      ],
      path: '/resources',
      title: t('words.resources'),
    },
    {
      id: 'tutorials',
      items: [
        {
          id: 'tutorial-nested',
          items: TUTORIALS_CATEGORIES.map((category) => ({
            description: t(`tutorials.${category.name}.shortDescription`),
            icon: category.image,
            id: category.name,
            path: category.route,
            title: t(`tutorials.${category.name}.title`),
          })),
        },
      ],
      path: '/tutorials',
      title: t('words.tutorials'),
    },
    {
      id: 'about-us',
      items: [
        {
          id: 'about-us-nested',
          items: [
            {
              description: t('menu.teachersDescription'),
              id: 'professors',
              path: '/professors',
              title: t('words.professors'),
            },
            {
              description: t('menu.nodeNetworkDescription'),
              id: 'node-network',
              path: '/node-network',
              title: t('words.nodeNetwork'),
            },
            {
              description: t('menu.bCertDescription'),
              id: 'b-cert',
              path: '/b-cert',
              title: t('words.bCert'),
            },
            {
              description: t('menu.planBLabsDescription'),
              id: 'plan-b-labs',
              path: '/plan-b-labs',
              title: t('labs.planBLabs'),
            },
            {
              description: t('menu.publicDescription'),
              id: 'public-release',
              path: '/public-communication',
              title: t('words.public'),
            },
          ],
        },
      ],
      path: '/about',
      title: t('words.about'),
    },
  ];

  const mobileSections: NavigationSectionMobile[] = [
    {
      id: 'courses',
      mobileIcon: coursesSvg,
      path: '/courses',
      title: t('words.courses'),
    },
    {
      id: 'events',
      mobileIcon: eventsSvg,
      path: '/events',
      title: t('words.events'),
    },
    {
      id: 'resources',
      mobileIcon: projectSvg,
      path: '/resources',
      title: t('words.resources'),
    },
    {
      id: 'tutorials',
      mobileIcon: tutorialsSvg,
      path: '/tutorials',
      title: t('words.tutorials'),
    },
    {
      id: 'about-us',
      items: [
        {
          description: t('menu.teachersDescription'),
          icon: <MdPeopleAlt size={20} className="shrink-0" />,
          id: 'professors',
          path: '/professors',
          title: t('words.professors'),
        },
        {
          description: t('menu.nodeNetworkDescription'),
          icon: <TbWorld size={20} className="shrink-0" />,
          id: 'node-network',
          path: '/node-network',
          title: t('words.nodeNetwork'),
        },
        {
          description: t('menu.bCertDescription'),
          icon: <MdOutlineSchool size={20} className="shrink-0" />,
          id: 'b-cert',
          path: '/b-cert',
          title: t('words.bCert'),
        },
        {
          description: t('menu.planBLabsDescription'),
          icon: <RiFlaskLine size={20} className="shrink-0" />,
          id: 'plan-b-labs',
          path: '/plan-b-labs',
          title: t('labs.planBLabs'),
        },
        {
          description: t('menu.publicDescription'),
          icon: <LuMessageSquareMore size={20} className="shrink-0" />,
          id: 'public-release',
          path: '/public-communication',
          title: t('words.public'),
        },
      ],
      mobileIcon: aboutSvg,
      title: t('words.about'),
    },
    isLoggedIn
      ? {
          action: () => {
            toggleDashboardMenu();
            toggleMobileMenu();
          },
          id: 'dashboard',
          mobileIcon: profileLogInWhite,
          removeFilterOnIcon: true,
          title: t('dashboard.studentDashboard'),
        }
      : {
          action: () => {
            setAuthMode(AuthModalState.SignIn);
            openAuthModal();
            toggleMobileMenu();
          },
          id: 'login',
          mobileIcon: profileLogInWhite,
          removeFilterOnIcon: true,
          title: t('menu.login'),
        },
    {
      id: 'search',
      mobileIcon: searchMobileSvg,
      path: '/search',
      title: t('words.search'),
    },
  ];

  return (
    <header
      className={cn(
        'fixed left-1/2 top-0 z-40 flex w-full max-w-[1440px] -translate-x-1/2 flex-row justify-between py-3 px-4 bg-header',
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
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <MobileMenu
        onClickLogin={() => {
          setAuthMode(AuthModalState.SignIn);
          openAuthModal();
        }}
        sections={[...mobileSections]}
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
