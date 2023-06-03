import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';
import { AiOutlineBook } from 'react-icons/ai';
import { BiDonateHeart } from 'react-icons/bi';
import {
  BsCart,
  BsCpu,
  BsCurrencyExchange,
  BsLightningCharge,
  BsMic,
  BsWallet2,
} from 'react-icons/bs';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { GrHistory } from 'react-icons/gr';
import { IoBusinessOutline, IoLibraryOutline } from 'react-icons/io5';
import { SiGithubsponsors, SiRaspberrypi } from 'react-icons/si';
import { generatePath } from 'react-router-dom';

import { useDisclosure } from '../../hooks';
import { Routes } from '../../types';
import { AuthModal } from '../AuthModal';

import { FlyingMenu } from './FlyingMenu';
import { MobileMenu } from './MobileMenu';
import { NavigationSection } from './props';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const Header = () => {
  const { t } = useTranslation();

  const {
    open: openLoginModal,
    isOpen: isLoginModalOpen,
    close: closeLoginModal,
  } = useDisclosure();

  /* 
  const { data: courses } = trpc.content.getCourses.useQuery();

  const coursesByLevel = courses?.reduce((acc, course) => {
    if (acc[course.level]) {
      acc[course.level].push(course);
    } else {
      acc[course.level] = [course];
    }
    return acc;
  }, {} as Record<string, JoinedCourse[]>);

  const coursesItems = Object.entries(coursesByLevel ?? {}).map(
    ([level, courses]) => ({
      id: level,
      title: capitalize(level),
      items: courses.map((course) => ({
        id: course.id,
        title: course.name,
        path: generatePath(Routes.Course, {
          courseId: course.id,
        }),
        icon: AiOutlineBook,
        description: course.goal,
      })),
    })
  );
 */

  const coursesItems = [
    {
      id: 'beginners',
      title: 'Beginner',
      items: [
        {
          id: 'btc101',
          title: 'BTC101',
          path: generatePath(Routes.Course, {
            courseId: 'btc101',
          }),
          icon: AiOutlineBook,
          description:
            'Get a better understanding of bitcoin with this lessons',
        },
        {
          id: 'ln101',
          title: 'LN 101',
          path: generatePath(Routes.Course, {
            courseId: 'ln101',
          }),
          icon: AiOutlineBook,
          description:
            'Get a better understanding of bitcoin with this lessons',
        },
        {
          id: 'econ101',
          title: 'ECON 101',
          path: generatePath(Routes.Course, {
            courseId: 'econ101',
          }),
          icon: AiOutlineBook,
          description:
            'Get a better understanding of bitcoin with this lessons',
        },
        {
          id: 'more-xxx-101',
          title: 'More',
          path: Routes.Courses,
          icon: AiOutlineBook,
          description:
            'Get a better understanding of bitcoin with this lessons',
        },
      ],
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      items: [
        {
          id: 'btc201',
          title: 'BTC 201',
          path: generatePath(Routes.Course, {
            courseId: 'btc201',
          }),

          icon: AiOutlineBook,
          description:
            'Get a better understanding of bitcoin with this lessons',
        },
        {
          id: 'econ201',
          title: 'ECON 201',
          path: generatePath(Routes.Course, {
            courseId: 'econ201',
          }),

          icon: AiOutlineBook,
          description:
            'Get a better understanding of bitcoin with this lessons',
        },
        {
          id: 'ln201',
          title: 'LN 201',
          path: generatePath(Routes.Course, {
            courseId: 'ln201',
          }),

          icon: AiOutlineBook,
          description:
            'Get a better understanding of bitcoin with this lessons',
        },
        {
          id: 'more-xxx-201',
          title: 'More',
          path: Routes.Courses,
          icon: AiOutlineBook,
          description:
            'Get a better understanding of bitcoin with this lessons',
        },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced',
      items: [
        {
          id: 'crypto301',
          title: 'CRYPTO 301',
          path: generatePath(Routes.Course, {
            courseId: 'crypto301',
          }),
          icon: AiOutlineBook,
          description:
            'Get a better understanding of bitcoin with this lessons',
        },
        {
          id: 'secu301',
          title: 'SECU 301',
          path: generatePath(Routes.Course, {
            courseId: 'secu301',
          }),
          icon: AiOutlineBook,
          description:
            'Get a better understanding of bitcoin with this lessons',
        },
        {
          id: 'fin301',
          title: 'FIN 301',
          path: generatePath(Routes.Course, {
            courseId: 'fin301',
          }),
          icon: AiOutlineBook,
          description:
            'Get a better understanding of bitcoin with this lessons',
        },
      ],
    },
  ];

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
              title: 'Library',
              icon: IoLibraryOutline,
              description: 'Discover plenty of books to improve your knowledge',
              path: Routes.Library,
            },
            {
              id: 'podcasts',
              title: 'Podcasts',
              description: 'Explore the bitcoin ecosystem through podcasts',
              path: Routes.Podcasts,
              icon: BsMic,
            },
            {
              id: 'builders',
              title: 'Builders',
              description:
                'Learn about the companies and projects that work at making bitcoin better and growing its adoption',
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
              title: 'Wallets',
              path: Routes.Wallets,
              icon: BsWallet2,
              description: 'Secure and use your bitcoins',
            },
            {
              id: 'exchanges',
              title: 'Exchanges',
              path: Routes.Exchanges,
              icon: BsCurrencyExchange,
              description:
                'Buy and sell bitcoins on exchanges and learn about P2P',
            },
            {
              id: 'lightning',
              title: 'Lightning',
              path: Routes.Lightning,
              icon: BsLightningCharge,
              description:
                'Manage your lightning node and use the lightning network',
            },
            {
              id: 'node',
              title: 'Node',
              path: Routes.Node,
              icon: SiRaspberrypi,
              description:
                'Learn how to be self-sovereign with your own bitcoin node',
            },
            {
              id: 'mining',
              title: 'Mining',
              path: Routes.Mining,
              icon: BsCpu,
              description:
                'Mine your own bitcoins and learn about the mining industry',
            },
            {
              id: 'merchants',
              title: 'Merchants',
              path: Routes.Merchants,
              icon: BsCart,
              description:
                'Accept bitcoin payments and discover tools for merchants',
            },
          ],
        },
      ],
    },
    {
      id: 'about-us',
      title: t('words.about-us'),
      path: Routes.UnderConstruction,
      items: [
        {
          id: 'about-us-nested',
          items: [
            {
              id: 'our-story',
              title: 'Our story',
              description: 'Learn about the story of the university',
              path: Routes.UnderConstruction,
              icon: GrHistory,
            },
            {
              id: 'sponsors',
              title: 'Sponsors & collaborators',
              description: 'Discover our sponsors and collaborators',
              path: Routes.UnderConstruction,
              icon: SiGithubsponsors,
            },
            {
              id: 'teachers',
              title: 'Teachers',
              description:
                'Get to know our university teachers, apassionate bitcoiners',
              path: Routes.UnderConstruction,
              icon: FaChalkboardTeacher,
            },
            {
              id: 'support-us',
              title: 'Support Us',
              description: 'Find ways to support us, by any manner',
              path: Routes.UnderConstruction,
              icon: BiDonateHeart,
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
    <header className="bg-primary-900 fixed left-0 top-0 z-20 flex min-h-[92px] w-screen flex-row place-items-center justify-between px-4 lg:px-12">
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

      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </header>
  );
};
