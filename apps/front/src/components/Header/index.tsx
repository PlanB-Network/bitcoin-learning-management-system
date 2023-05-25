import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useMemo } from 'react';
import {
  AiOutlineBook,
  AiOutlineFileText,
  AiOutlineNodeIndex,
} from 'react-icons/ai';
import { BiDonateHeart, BiPalette } from 'react-icons/bi';
import {
  BsBook,
  BsCalendarDate,
  BsCpu,
  BsCurrencyExchange,
  BsJournalRichtext,
  BsLightningCharge,
  BsMic,
  BsNewspaper,
  BsWallet2,
} from 'react-icons/bs';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { GrArticle, GrHistory } from 'react-icons/gr';
import { IoBusinessOutline, IoLibraryOutline } from 'react-icons/io5';
import { SiGithubsponsors, SiRaspberrypi } from 'react-icons/si';
import { Link } from 'react-router-dom';

import headerImage from '../../assets/db-academy-header-1.png';
import { useAppSelector, useDisclosure } from '../../hooks';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';
import { AuthModal } from '../AuthModal';

import { FlyingMenu } from './FlyingMenu';
import { MobileMenu } from './MobileMenu';
import { NavigationSection } from './props';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const Header = () => {
  const {
    open: openLoginModal,
    isOpen: isLoginModalOpen,
    close: closeLoginModal,
  } = useDisclosure();

  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  const sections: NavigationSection[] = useMemo(
    () => [
      {
        id: 'courses',
        title: 'Courses',
        items: [
          {
            id: 'annee-1',
            title: '1ère année',
            items: [
              {
                id: 'btc-101',
                title: 'BTC 101',
                path: replaceDynamicParam(Routes.Course, {
                  courseId: 'btc-101',
                }),
                icon: AiOutlineBook,
                description:
                  'Get a better understanding of bitcoin with this lessons',
              },
              {
                id: 'ln-101',
                title: 'LN 101',
                path: replaceDynamicParam(Routes.Course, {
                  courseId: 'ln-101',
                }),
                icon: AiOutlineBook,
                description:
                  'Get a better understanding of bitcoin with this lessons',
              },
              {
                id: 'econ-101',
                title: 'ECON 101',
                path: replaceDynamicParam(Routes.Course, {
                  courseId: 'econ-101',
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
            id: 'annee-2',
            title: '2nde année',
            items: [
              {
                id: 'btc-201',
                title: 'BTC 201',
                path: replaceDynamicParam(Routes.Course, {
                  courseId: 'btc-201',
                }),

                icon: AiOutlineBook,
                description:
                  'Get a better understanding of bitcoin with this lessons',
              },
              {
                id: 'econ-201',
                title: 'ECON 201',
                path: replaceDynamicParam(Routes.Course, {
                  courseId: 'econ-201',
                }),

                icon: AiOutlineBook,
                description:
                  'Get a better understanding of bitcoin with this lessons',
              },
              {
                id: 'ln-201',
                title: 'LN 201',
                path: replaceDynamicParam(Routes.Course, {
                  courseId: 'ln-201',
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
            id: 'annee-3',
            title: '3ème année',
            items: [
              {
                id: 'crypto-301',
                title: 'CRYPTO 301',
                path: replaceDynamicParam(Routes.Course, {
                  courseId: 'crypto-301',
                }),
                icon: AiOutlineBook,
                description:
                  'Get a better understanding of bitcoin with this lessons',
              },
              {
                id: 'secu-301',
                title: 'SECU 301',
                path: replaceDynamicParam(Routes.Course, {
                  courseId: 'secu-301',
                }),
                icon: AiOutlineBook,
                description:
                  'Get a better understanding of bitcoin with this lessons',
              },
              {
                id: 'fin-301',
                title: 'FIN 301',
                path: replaceDynamicParam(Routes.Course, {
                  courseId: 'fin-301',
                }),
                icon: AiOutlineBook,
                description:
                  'Get a better understanding of bitcoin with this lessons',
              },
            ],
          },
        ],
      },
      {
        id: 'resources',
        title: 'Resources',
        path: Routes.Resources,
        items: [
          {
            id: 'medias',
            title: 'Medias',
            items: [
              {
                id: 'library',
                title: 'Library',
                icon: IoLibraryOutline,
                description:
                  'discover plenty of books to improve your knowledge on the bitcoin ecosystem and related economic topics',
                path: Routes.Library,
              },
              {
                id: 'newsletter',
                title: 'Newsletter',
                path: Routes.Newsletter,
                icon: BsNewspaper,
              },
              {
                id: 'articles',
                title: 'Articles',
                path: Routes.Articles,
                icon: GrArticle,
              },
              { id: 'learning', title: 'Learning tools', path: Routes.Tools },
            ],
          },
          {
            id: 'people',
            title: 'People',
            items: [
              {
                id: 'companies',
                title: 'Bitcoin Companies',
                icon: IoBusinessOutline,
                description:
                  'Learn about the companies that work at making bitcoin better and growing its adoption',
                path: Routes.Companies,
              },
              {
                id: 'artiste',
                title: 'Artiste',
                path: Routes.Articles,
                icon: BiPalette,
              },
              {
                id: 'conferences',
                title: 'Conferences',
                path: Routes.Conferences,
                icon: BsMic,
              },
              {
                id: 'bitcoin-calendar',
                title: 'Bitcoin Calendar',
                path: Routes.Calendar,
                icon: BsCalendarDate,
              },
            ],
          },
          {
            id: 'tech',
            title: 'Technical',
            items: [
              {
                id: 'bips',
                title: 'BIPs',
                path: Routes.BIPs,
                icon: AiOutlineFileText,
              },
              {
                id: 'lexique',
                title: 'Lexique',
                path: Routes.Lexique,
                icon: BsBook,
              },
            ],
          },
        ],
      },
      {
        id: 'tutorials',
        title: 'Tutorials',
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
                description:
                  'Get a better understanding of wallets with these tutorials',
              },
              {
                id: 'exchanges',
                title: 'Exchanges',
                path: Routes.Exchanges,
                icon: BsCurrencyExchange,
                description:
                  'Get a better understanding of exchanges with these tutorials',
              },
              {
                id: 'lightning',
                title: 'Lightning',
                path: Routes.Lightning,
                icon: BsLightningCharge,
                description:
                  'Get a better understanding of the lighning network with these tutorials',
              },
              {
                id: 'ordinals',
                title: 'Ordinals',
                path: Routes.Ordinal,
                icon: AiOutlineNodeIndex,
                description:
                  'Get a better understanding of ordinals with these tutorials',
              },
              {
                id: 'node',
                title: 'Node',
                path: Routes.Node,
                icon: SiRaspberrypi,
                description:
                  'Get a better understanding of bitcoin nodes with these tutorials',
              },
              {
                id: 'mining',
                title: 'Mining',
                path: Routes.Mining,
                icon: BsCpu,
                description:
                  'Get a better understanding of bitcoin mining with these tutorials',
              },
            ],
          },
        ],
      },
      {
        id: 'about-us',
        title: 'About us',
        items: [
          {
            id: 'about-us-nested',
            items: [
              {
                id: 'our-story',
                title: 'Our story',
                description: 'learn more about how we went to what we are now',
                icon: GrHistory,
              },
              {
                id: 'sponsors',
                title: 'Sponsors & collaborators',
                description: 'discover our wonderfull sponsors',
                icon: SiGithubsponsors,
              },
              {
                id: 'teachers',
                title: 'Teachers',
                description:
                  'get to know our academy teachers, experts in their domains',
                icon: FaChalkboardTeacher,
              },
              {
                id: 'support-us',
                title: 'Support Us',
                description: 'find ways to support us, by any manner',
                icon: BiDonateHeart,
              },
              {
                id: 'press-kit',
                title: 'Press Kit',
                description: 'assets for press articles',
                icon: BsJournalRichtext,
              },
            ],
          },
        ],
      },
      isLoggedIn
        ? {
          id: 'my-account',
          title: 'My Account',
          action: () => {
            console.log('hello');
          },
        }
        : {
          id: 'account',
          title: 'Account',
          action: () => {
            openLoginModal();
          },
        },
    ],
    [isLoggedIn, openLoginModal]
  );

  const isScreenMd = useGreater('sm');

  return (
    <header className="flex fixed top-0 left-0 z-20 flex-col justify-center items-center py-6 w-screen bg-primary-900 min-h-[96px]">
      {isScreenMd ? (
        <Link
          to={Routes.Home}>
          <img
            className="absolute left-8 h-10"
            src={headerImage}
            alt="Decouvre Bitcoin header logo"
          />
        </Link>
      ) : (
        <MobileMenu sections={sections} />
      )}

      {isScreenMd && <FlyingMenu sections={sections} />}

      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </header>
  );
};
