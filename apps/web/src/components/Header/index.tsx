import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { capitalize } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineBook } from 'react-icons/ai';
import { BsFileText, BsMic, BsPlus } from 'react-icons/bs';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { GiMeshNetwork } from 'react-icons/gi';
import {
  IoBusinessOutline,
  IoLibraryOutline,
  IoSchoolOutline,
} from 'react-icons/io5';

import { useDisclosure } from '../../hooks/use-disclosure';
import { Routes } from '../../routes/routes';
import { TRPCRouterOutput, trpc } from '../../utils/trpc';
import { TUTORIALS_CATEGORIES } from '../../utils/tutorials';
import { AuthModal } from '../AuthModal';
import { AuthModalState } from '../AuthModal/props';

import { FlyingMenu } from './FlyingMenu';
import { MobileMenu } from './MobileMenu';
import { NavigationSection } from './props';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

type Course = NonNullable<TRPCRouterOutput['content']['getCourses']>[number];

export const Header = () => {
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
      const level = course.level.toLowerCase() as typeof course.level;
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
      title: t('words.about-us'),
      path: Routes.Manifesto,
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
      items: coursesItems,
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
              id: 'builders',
              title: t('words.builders'),
              description: t('menu.buildersDescription'),
              path: Routes.Builders,
              icon: IoBusinessOutline,
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
      id: 'professors',
      title: t('words.professors'),
      path: Routes.Professors,
    },
    {
      id: 'about-us',
      title: t('words.about-us'),
      path: Routes.Manifesto,
      items: [
        {
          id: 'about-us-nested',
          items: [
            {
              id: 'manifesto',
              title: t('words.manifesto'),
              description: t('menu.manifestoDescription'),
              path: Routes.Manifesto,
              icon: BsFileText,
            },
          ],
        },
      ],
    },
  ];

  const homeSection: NavigationSection[] = [
    {
      id: 'home',
      title: t('words.home'),
      path: Routes.Home,
    },
  ];

  const isScreenMd = useGreater('md');

  return (
    <header className="bg-blue-1000 sticky left-0 top-0 z-20 flex w-full flex-row place-items-center justify-between p-3 px-4 md:min-h-[96px] lg:px-12">
      {isScreenMd ? (
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
        />
      ) : (
        <MobileMenu
          onClickLogin={() => {
            setAuthMode(AuthModalState.SignIn);
            openAuthModal();
          }}
          onClickRegister={() => {
            setAuthMode(AuthModalState.Register);
            openAuthModal();
          }}
          sections={homeSection.concat(mobileSections)}
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
