import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { capitalize } from 'lodash';
import { useTranslation } from 'react-i18next';
import { AiOutlineBook } from 'react-icons/ai';
import {
  BsCart,
  BsCpu,
  BsCurrencyExchange,
  BsFileText,
  BsHeart,
  BsLightningCharge,
  BsMic,
  BsPlus,
  BsWallet2,
} from 'react-icons/bs';
import { IoBusinessOutline, IoLibraryOutline } from 'react-icons/io5';
import { SiRaspberrypi } from 'react-icons/si';
import { generatePath } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';
import { JoinedCourse } from '@sovereign-academy/types';

import { useDisclosure } from '../../hooks';
import { Routes } from '../../types';
// import { AuthModal } from '../AuthModal';

import { FlyingMenu } from './FlyingMenu';
import { MobileMenu } from './MobileMenu';
import { NavigationSection } from './props';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const Header = () => {
  const { t, i18n } = useTranslation();

  const {
    open: openLoginModal,
    /* isOpen: isLoginModalOpen,
    close: closeLoginModal, */
  } = useDisclosure();

  const { data: courses } = trpc.content.getCourses.useQuery({
    language: i18n.language ?? 'en',
  });

  const coursesByLevel = courses?.reduce(
    (acc, course) => {
      acc[course.level].push(course);
      return acc;
    },
    {
      beginner: [],
      intermediate: [],
      advanced: [],
      expert: [],
    } as {
      beginner: JoinedCourse[];
      intermediate: JoinedCourse[];
      advanced: JoinedCourse[];
      expert: JoinedCourse[];
    }
  );

  const coursesItems = Object.entries(coursesByLevel ?? {}).flatMap(
    ([level, courses]) => {
      const formatted = courses.map((course) => ({
        id: course.id,
        title: course.id.toUpperCase(),
        path: generatePath(Routes.Course, {
          courseId: course.id,
        }),
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
                        path: generatePath(Routes.Courses, {
                          level,
                        }),
                        icon: BsPlus,
                      },
                    ]
                  : formatted,
            },
          ];
    }
  );

  /*   const coursesItems = [
    {
      id: 'beginners',
      title: t('words.beginner'),
      items: [
        {
          id: 'btc101',
          title: 'BTC101',
          path: generatePath(Routes.Course, {
            courseId: 'btc101',
          }),
          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
        {
          id: 'ln101',
          title: 'LN101',
          path: generatePath(Routes.Course, {
            courseId: 'ln101',
          }),
          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
        {
          id: 'econ101',
          title: 'ECON101',
          path: generatePath(Routes.Course, {
            courseId: 'econ101',
          }),
          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
        {
          id: 'more-xxx-101',
          title: t('words.more'),
          path: Routes.Courses,
          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
      ],
    },
    {
      id: 'intermediate',
      title: t('words.intermediate'),
      items: [
        {
          id: 'btc201',
          title: 'BTC201',
          path: generatePath(Routes.Course, {
            courseId: 'btc201',
          }),

          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
        {
          id: 'econ201',
          title: 'ECON201',
          path: generatePath(Routes.Course, {
            courseId: 'econ201',
          }),

          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
        {
          id: 'ln201',
          title: 'LN201',
          path: generatePath(Routes.Course, {
            courseId: 'ln201',
          }),

          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
        {
          id: 'more-xxx-201',
          title: t('words.more'),
          path: Routes.Courses,
          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
      ],
    },
    {
      id: 'advanced',
      title: t('words.advanced'),
      items: [
        {
          id: 'crypto301',
          title: 'CRYPTO 301',
          path: generatePath(Routes.Course, {
            courseId: 'crypto301',
          }),
          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
        {
          id: 'secu301',
          title: 'SECU 301',
          path: generatePath(Routes.Course, {
            courseId: 'secu301',
          }),
          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
        {
          id: 'fin301',
          title: 'FIN 301',
          path: generatePath(Routes.Course, {
            courseId: 'fin301',
          }),
          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
      ],
    },
  ]; */

  const sections: NavigationSection[] = [
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
          items: [
            {
              id: 'wallets',
              title: t('words.wallets'),
              path: Routes.Wallets,
              icon: BsWallet2,
              description: t('menu.walletsDescription'),
            },
            {
              id: 'exchanges',
              title: t('words.exchanges'),
              path: Routes.Exchanges,
              icon: BsCurrencyExchange,
              description: t('menu.exchangesDescription'),
            },
            {
              id: 'lightning',
              title: t('words.lightning'),
              path: Routes.Lightning,
              icon: BsLightningCharge,
              description: t('menu.lightningDescription'),
            },
            {
              id: 'node',
              title: t('words.node'),
              path: Routes.Node,
              icon: SiRaspberrypi,
              description: t('menu.nodeDescription'),
            },
            {
              id: 'mining',
              title: t('words.mining'),
              path: Routes.Mining,
              icon: BsCpu,
              description: t('menu.miningDescription'),
            },
            {
              id: 'merchants',
              title: t('words.merchants'),
              path: Routes.Merchants,
              icon: BsCart,
              description: t('menu.merchantsDescription'),
            },
          ],
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
              id: 'manifesto',
              title: t('words.manifesto'),
              description: t('menu.manifestoDescription'),
              path: Routes.Manifesto,
              icon: BsFileText,
            },
            {
              id: 'sponsors-and-contributors',
              title: t('words.sponsoringAndContributors'),
              description: t('menu.sponsorsDescription'),
              path: Routes.UnderConstruction,
              icon: BsHeart,
            },
            /*             {
              id: 'teachers',
              title: t('words.teachers'),
              description: t('menu.teachersDescription'),
              path: Routes.UnderConstruction,
              icon: FaChalkboardTeacher,
            },
            {
              id: 'support-us',
              title: t('words.supportUs'),
              description: t('menu.supportUsDescription'),
              path: Routes.UnderConstruction,
              icon: BiDonateHeart,
            }, */
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
    <header className="bg-primary-900 fixed left-0 top-0 z-20 flex w-full flex-row place-items-center justify-between p-3 px-4 md:min-h-[96px] lg:px-12">
      {isScreenMd ? (
        <FlyingMenu
          onClickLogin={openLoginModal}
          onClickRegister={openLoginModal}
          sections={sections}
        />
      ) : (
        <MobileMenu
          onClickLogin={openLoginModal}
          onClickRegister={openLoginModal}
          sections={homeSection.concat(sections)}
        />
      )}

      {/* <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} /> */}
    </header>
  );
};
