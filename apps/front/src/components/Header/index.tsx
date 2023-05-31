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
import { Link } from 'react-router-dom';
import { VscTools } from 'react-icons/vsc';
import { GiOldMicrophone } from 'react-icons/gi';

import headerImage from '../../assets/lapin-diplome.png';
import { Button } from '../../atoms/Button';
import { useAppSelector, useDisclosure } from '../../hooks';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';
import { AuthModal } from '../AuthModal';

import { FlyingMenu } from './FlyingMenu';
import { LanguageSelector } from './LanguageSelector';
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

  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  const sections: NavigationSection[] = [
    {
      id: 'courses',
      title: t('words.courses'),
      path: Routes.Courses,
      items: [
        {
          id: 'beginners',
          title: 'Beginners',
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
          id: 'intermediate',
          title: 'Intermediate',
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
          id: 'advanced',
          title: 'Advanced',
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
      path: Routes.AboutUs,
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

  const isScreenMd = useGreater('sm');

  return (
    <header className="flex fixed top-0 left-0 z-20 flex-row justify-between place-items-center px-12 w-screen bg-primary-900 min-h-[92px]">
      {isScreenMd ? (
        <Link to={Routes.Home}>
          <img className="h-16" src={headerImage} alt="DecouvreBitcoin Logo" />
        </Link>
      ) : (
        <MobileMenu sections={sections} />
      )}

      {isScreenMd && <FlyingMenu sections={sections} />}
      {isScreenMd && (
        <div className="flex flex-row place-items-center space-x-6">
          <LanguageSelector />
          {isLoggedIn && <div className="text-white">Account</div>}

          {!isLoggedIn && (
            <div className="flex flex-row space-x-4">
              <Button
                className="my-4"
                variant="tertiary"
                rounded
                onClick={openLoginModal}
              >
                Register
              </Button>
              <Button className="my-4" rounded onClick={openLoginModal}>
                Login
              </Button>
            </div>
          )}
        </div>
      )}

      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </header>
  );
};

/* Backup of the big menu for later, keeping only the MVP content for now

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
                  'Discover plenty of books to improve your knowledge on the bitcoin ecosystem and related economic topics.',
                path: Routes.Library,
              },
              {
                id: 'newsletter',
                title: 'Newsletter',
                path: Routes.Newsletter,
                description:
                  'Find out the most relevant newsletters of the ecosystem.',
                icon: BsNewspaper,
              },
              {
                id: 'articles',
                title: 'Articles',
                path: Routes.Articles,
                description:
                  'Read the latest books qbout topics like Bitcoin, tech, privacy and economy.',
                icon: GrArticle,
              },
              {
                id: 'podcasts',
                title: 'Podcasts',
                path: Routes.Podcasts,
                icon: GiOldMicrophone,
                description:
                  'Listen to the latest recorded podcast and catch up on the hot topics.',
              },
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
                  'Learn about the companies that work at making bitcoin better and growing its adoption.',
                path: Routes.Companies,
              },
              {
                id: 'artiste',
                title: 'Artiste',
                path: Routes.Articles,
                description: 'Discover your next favorite bitcoin artists.',
                icon: BiPalette,
              },
              {
                id: 'conferences',
                title: 'Conferences',
                path: Routes.Conferences,
                description:
                  'Find out where to meet great people around Bitcoin topics.',
                icon: BsMic,
              },
              {
                id: 'bitcoin-calendar',
                title: 'Bitcoin Calendar',
                description: 'Check out the next important Bitcoin dates.',
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
                description:
                  'Get explanations about all the major Bitcoin Improvement Proposals',
              },
              {
                id: 'lexique',
                title: 'Lexique',
                path: Routes.Lexique,
                description:
                  "Don't get lost in a dialog thanks to this lexical repertory",
                icon: BsBook,
              },
              {
                id: 'learning',
                title: 'Learning tools',
                icon: VscTools,
                path: Routes.Tools,
                description:
                  'Various curated tools to educate yourself on Bitcoin',
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

*/
