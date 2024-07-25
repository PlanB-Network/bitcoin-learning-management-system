import { capitalize } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedCourseWithProfessors } from '@blms/types';
import { cn } from '@blms/ui';

import { useGreater } from '#src/hooks/use-greater.js';

import resourcesSvg from '../../assets/resources/builder.svg?react';
import eventsSvg from '../../assets/resources/conference.svg?react';
// import glossarySvg from '../../assets/resources/glossary.svg?react';
import coursesSvg from '../../assets/resources/library.svg?react';
import podcastSvg from '../../assets/resources/podcast.svg?react';
import tutorialsSvg from '../../assets/resources/toolkit.svg?react';
import aboutSvg from '../../assets/resources/world.svg?react';
import { useDisclosure } from '../../hooks/use-disclosure.ts';
import { trpc } from '../../utils/trpc.ts';
import { TUTORIALS_CATEGORIES } from '../../utils/tutorials.ts';
import { AuthModal } from '../AuthModal/index.tsx';
import { AuthModalState } from '../AuthModal/props.ts';

import { FlyingMenu } from './FlyingMenu/index.tsx';
import { MobileMenu } from './MobileMenu/index.tsx';
import type { NavigationSection } from './props.tsx';

type Course = JoinedCourseWithProfessors;

interface HeaderProps {
  variant?: 'light' | 'dark';
}

export const Header = ({ variant = 'dark' }: HeaderProps) => {
  const { t, i18n } = useTranslation();

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  // Todo change this when better auth flow is implemented (this is awful)
  const [authMode, setAuthMode] = useState<AuthModalState>(
    AuthModalState.SignIn,
  );

  const { data: courses } = trpc.content.getCourses.useQuery(
    {
      language: i18n.language ?? 'en',
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const coursesByLevel = courses?.reduce(
    (acc, course) => {
      const level = course.level.toLocaleLowerCase() as keyof typeof acc;

      if (acc[level]) {
        acc[level].push(course);
      }

      return acc;
    },
    {
      beginner: [],
      intermediate: [],
      advanced: [],
      wizard: [],
    } as {
      beginner: Course[];
      intermediate: Course[];
      advanced: Course[];
      wizard: Course[];
    },
  );

  const coursesItems = Object.entries(coursesByLevel ?? {}).flatMap(
    ([level, courses]) => {
      const formatted = courses.map((course) => {
        const courseId = course.id.toUpperCase();
        const formattedTitle = courseId.slice(0, 3) + ' ' + courseId.slice(3);
        return {
          id: course.id,
          title: formattedTitle,
          path: `/courses/${course.id}`,
          description: course.name,
        };
      });

      return formatted.length === 0
        ? []
        : [
            {
              id: level,
              title: capitalize(level),
              items: formatted,
            },
          ];
    },
  );

  // Todo, refactor desktop/mobile duplication
  const desktopSections: NavigationSection[] = [
    {
      id: 'courses',
      title: t('words.courses'),
      path: '/courses',
      items: coursesItems,
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
            // {
            //   id: 'glossary',
            //   title: t('words.glossary'),
            //   description: t('menu.glossaryDescription'),
            //   path: '/resources/glossary',
            //   icon: glossarySvg,
            // },
            {
              id: 'bet',
              title: t('bet.pageTitle'),
              description: t('menu.betDescription'),
              path: '/resources/bet',
              icon: tutorialsSvg,
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
        />
      )}
    </header>
  );
};
