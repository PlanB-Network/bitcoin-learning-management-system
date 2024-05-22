import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { capitalize } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineBook } from 'react-icons/ai';
import { BsFileText, BsMic, BsPeople, BsPlus } from 'react-icons/bs';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { GiMeshNetwork } from 'react-icons/gi';
import {
  IoBusinessOutline,
  IoLibraryOutline,
  IoSchoolOutline,
} from 'react-icons/io5';
import { LuArmchair } from 'react-icons/lu';

import { cn } from '@sovereign-university/ui';

import resourcesSvg from '../../assets/resources/builder.svg';
import eventsSvg from '../../assets/resources/conference.svg';
import coursesSvg from '../../assets/resources/library.svg';
import tutorialsSvg from '../../assets/resources/toolkit.svg';
import aboutSvg from '../../assets/resources/world.svg';
import { useDisclosure } from '../../hooks/use-disclosure.ts';
import { Routes } from '../../routes/routes.ts';
import { trpc } from '../../utils/trpc.ts';
import type { TRPCRouterOutput } from '../../utils/trpc.tsx';
import { TUTORIALS_CATEGORIES } from '../../utils/tutorials.ts';
import { AuthModal } from '../AuthModal/index.tsx';
import { AuthModalState } from '../AuthModal/props.ts';

import { FlyingMenu } from './FlyingMenu/index.tsx';
import { MobileMenu } from './MobileMenu/index.tsx';
import type { NavigationSection } from './props.tsx';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

type Course = NonNullable<TRPCRouterOutput['content']['getCourses']>[number];

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

  const { data: courses } = trpc.content.getCourses.useQuery({
    language: i18n.language ?? 'en',
  });

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
      developer: [],
    } as {
      beginner: Course[];
      intermediate: Course[];
      advanced: Course[];
      developer: Course[];
    },
  );

  const coursesItems = Object.entries(coursesByLevel ?? {}).flatMap(
    ([level, courses]) => {
      const formatted = courses.map((course) => ({
        id: course.id,
        title: course.id.toUpperCase(),
        path: `/courses/${course.id}`,
        icon: AiOutlineBook,
        description: course.name,
      }));

      return formatted.length === 0
        ? []
        : [
            {
              id: level,
              title: capitalize(level),
              items:
                formatted.length > 4
                  ? [
                      ...formatted.slice(0, 4),
                      {
                        id: 'more',
                        title: t('words.more'),
                        path: `/courses`,
                        icon: BsPlus,
                      },
                    ]
                  : formatted,
            },
          ];
    },
  );

  // Todo, refactor desktop/mobile duplication
  const desktopSections: NavigationSection[] = [
    {
      id: 'courses',
      title: t('words.courses'),
      path: Routes.Courses,
      items: coursesItems,
    },
    {
      id: 'events',
      title: t('words.events'),
      path: Routes.Events,
    },
    {
      id: 'resources',
      title: t('words.resources'),
      path: Routes.Resources,
      items: [
        {
          id: 'resources-nested',
          items: [
            {
              id: 'library',
              title: t('words.library'),
              icon: IoLibraryOutline,
              description: t('menu.libraryDescription'),
              path: Routes.Books,
            },
            {
              id: 'podcasts',
              title: t('words.podcasts'),
              description: t('menu.podcastsDescription'),
              path: Routes.Podcasts,
              icon: BsMic,
            },
            {
              id: 'conferences',
              title: t('conferences.pageTitle'),
              description: t('menu.conferencesDescription'),
              path: Routes.Conferences,
              icon: LuArmchair,
            },
            {
              id: 'builders',
              title: t('words.builders'),
              description: t('menu.buildersDescription'),
              path: Routes.Builders,
              icon: IoBusinessOutline,
            },
            {
              id: 'bet',
              title: t('bet.pageTitle'),
              description: t('menu.betDescription'),
              path: Routes.BET,
              icon: IoSchoolOutline,
            },
          ],
        },
      ],
    },
    {
      id: 'tutorials',
      title: t('words.tutorials'),
      path: Routes.Tutorials,
      items: [
        {
          id: 'tutorial-nested',
          items: TUTORIALS_CATEGORIES.map((category) => ({
            id: category.name,
            title: t(`tutorials.${category.name}.title`),
            path: category.route,
            icon: category.icon,
            description: t(`tutorials.${category.name}.shortDescription`),
          })),
        },
      ],
    },
    {
      id: 'about-us',
      title: t('words.about'),
      path: Routes.About,
      items: [
        {
          id: 'about-us-nested',
          items: [
            {
              id: 'professors',
              title: t('words.professors'),
              description: t('menu.teachersDescription'),
              path: Routes.Professors,
              icon: FaChalkboardTeacher,
            },
            {
              id: 'node-network',
              title: t('words.nodeNetwork'),
              description: t('menu.nodeNetworkDescription'),
              path: Routes.NodeNetwork,
              icon: GiMeshNetwork,
            },
            {
              id: 'manifesto',
              title: t('words.manifesto'),
              description: t('menu.manifestoDescription'),
              path: Routes.Manifesto,
              icon: BsFileText,
            },
            {
              id: 'about',
              title: t('words.about-us'),
              description: t('words.about-us'),
              path: Routes.About,
              icon: BsPeople,
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
      path: Routes.Courses,
      mobileIcon: coursesSvg,
    },
    {
      id: 'events',
      title: t('words.events'),
      path: Routes.Events,
      mobileIcon: eventsSvg,
    },
    {
      id: 'resources',
      title: t('words.resources'),
      path: Routes.Resources,
      mobileIcon: resourcesSvg,
    },
    {
      id: 'tutorials',
      title: t('words.tutorials'),
      path: Routes.Tutorials,
      mobileIcon: tutorialsSvg,
    },
    {
      id: 'about-us',
      title: t('words.about'),
      path: Routes.About,
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
