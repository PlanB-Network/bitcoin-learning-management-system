import { useMemo } from 'react';
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
import { useGreater } from '../../hooks/useGreater';
import { Routes } from '../../types';
import { AuthModal } from '../AuthModal';

import { FlyingMenu } from './FlyingMenu';
import { MobileMenu } from './MobileMenu';
import { NavigationSection } from './props';

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
          title: 'LN 101',
          path: generatePath(Routes.Course, {
            courseId: 'ln101',
          }),
          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
        {
          id: 'econ101',
          title: 'ECON 101',
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
          title: 'BTC 201',
          path: generatePath(Routes.Course, {
            courseId: 'btc201',
          }),

          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
        {
          id: 'econ201',
          title: 'ECON 201',
          path: generatePath(Routes.Course, {
            courseId: 'econ201',
          }),

          icon: AiOutlineBook,
          description: t('menu.btc101Description'),
        },
        {
          id: 'ln201',
          title: 'LN 201',
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
              title: t('words.library'),
              icon: IoLibraryOutline,
              description: t('menu.libraryDescription'),
              path: Routes.Library,
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
      path: Routes.AboutUs,
      items: [
        {
          id: 'about-us-nested',
          items: [
            {
              id: 'our-story',
              title: t('words.ourStory'),
              description: t('menu.ourStoryDescription'),
              path: Routes.UnderConstruction,
              icon: GrHistory,
            },
            {
              id: 'sponsors',
              title: t('words.sponsoringAndContributors'),
              description: t('menu.sponsorsDescription'),
              path: Routes.UnderConstruction,
              icon: SiGithubsponsors,
            },
            {
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

  const menu = useMemo(() => {
    if (isScreenMd === null) return null;

    if (isScreenMd)
      return (
        <FlyingMenu
          onClickLogin={openLoginModal}
          onClickRegister={openLoginModal}
          sections={sections}
        />
      );

    return (
      <MobileMenu
        onClickLogin={openLoginModal}
        onClickRegister={openLoginModal}
        sections={homeSection.concat(sections)}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScreenMd, openLoginModal, sections]);

  return (
    <header className="bg-primary-900 fixed left-0 top-0 z-20 flex w-screen flex-row place-items-center justify-between p-3 md:min-h-[92px] md:p-0 lg:px-12">
      {menu}
      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </header>
  );
};
