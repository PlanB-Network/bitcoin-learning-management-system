import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useMemo } from 'react';

import headerImage from '../../assets/db-academy-header-1.png';
import companiesIcon from '../../assets/navigation-icons/companies.png';
import libraryIcon from '../../assets/navigation-icons/library.png';
import { useAppSelector, useDisclosure } from '../../hooks';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';
import { AuthModal } from '../AuthModal';

import {
  headerExpandedImageStyle,
  headerShrinkedImageStyle,
  headerSideImageStyle,
  headerStyle,
} from './index.css';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { NavigationElement, NavigationSection } from './props';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export interface HeaderProps {
  isExpanded: boolean;
}

export const Header = ({ isExpanded }: HeaderProps) => {
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
              [
                {
                  id: 'btc-101',
                  title: 'BTC 101',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'btc-101',
                  }),
                },
                {
                  id: 'ln-101',
                  title: 'LN 101',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'ln-101',
                  }),
                },
                {
                  id: 'econ-101',
                  title: 'ECON 101',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'econ-101',
                  }),
                },
                {
                  id: 'fin-101',
                  title: 'FIN 101',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'fin-101',
                  }),
                },
                {
                  id: 'secu-101',
                  title: 'SECU 101',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'secu-101',
                  }),
                },
              ],
            ],
          },
          {
            id: 'annee-2',
            title: '2nde année',
            items: [
              [
                {
                  id: 'btc-201',
                  title: 'BTC 201',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'btc-201',
                  }),
                },
                {
                  id: 'btc-204',
                  title: 'BTC 204',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'btc-204',
                  }),
                },
                {
                  id: 'econ-201',
                  title: 'ECON 201',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'econ-201',
                  }),
                },
                {
                  id: 'ln-201',
                  title: 'LN 201',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'ln-201',
                  }),
                },
              ],
              [
                {
                  id: 'ln-202',
                  title: 'LN 202',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'ln-202',
                  }),
                },
                {
                  id: 'btc-205',
                  title: 'BTC 205',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'btc-205',
                  }),
                },
                {
                  id: 'econ-203',
                  title: 'ECON 203',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'econ-203',
                  }),
                },
              ],
            ],
          },
          {
            id: 'annee-3',
            title: '3ème année',
            items: [
              [
                {
                  id: 'crypto-301',
                  title: 'CRYPTO 301',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'crypto-301',
                  }),
                },
                {
                  id: 'secu-301',
                  title: 'SECU 301',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'secu-301',
                  }),
                },
                {
                  id: 'fin-301',
                  title: 'FIN 301',
                  path: replaceDynamicParam(Routes.Course, {
                    courseId: 'fin-301',
                  }),
                },
              ],
            ],
          },
        ],
      },
      {
        id: 'ressources',
        title: 'Ressources',
        items: [
          {
            id: 'search',
            title: 'Recherche libre',
            items: [
              [
                {
                  id: 'librairie',
                  title: 'Librairie',
                  img: libraryIcon,
                  description:
                    'discover plenty of books to improve your knowledge on the bitcoin ecosystem and related economic topics',
                  path: Routes.Librairy,
                },
                {
                  id: 'companies',
                  title: 'Bitcoin Companies',
                  img: companiesIcon,
                  description:
                    'Learn about the companies that work at making bitcoin better and growing its adoption',
                  path: Routes.Companies,
                },
                {
                  id: 'artiste',
                  title: 'Artiste',
                  path: Routes.Articles,
                },
              ],
              [
                {
                  id: 'newsletter',
                  title: 'Newsletter',
                  path: Routes.Newsletter,
                },
                {
                  id: 'conferences',
                  title: 'Conferences',
                  path: Routes.Conferences,
                },
                {
                  id: 'bips',
                  title: 'BIPs',
                  path: Routes.Conferences,
                },
              ],
              [
                { id: 'lexique', title: 'Lexique', path: Routes.Lexique },
                {
                  id: 'bitcoin-calendar',
                  title: 'Bitcoin Calendar',
                  path: Routes.Calendar,
                },
                { id: 'articles', title: 'Articles', path: Routes.Articles },
                { id: 'learning', title: 'Learning tools', path: Routes.Tools },
              ],
            ],
          },
        ],
      },
      {
        id: 'tutorials',
        title: 'Tutorials',
        items: [
          [
            { id: 'wallets', title: 'Wallets', path: Routes.Wallets },
            { id: 'exchanges', title: 'Exchanges', path: Routes.Exchanges },
            { id: 'lightning', title: 'Lightning', path: Routes.Lightning },
          ],
          [
            { id: 'ordinals', title: 'Ordinals', path: Routes.Ordinal },
            { id: 'node', title: 'Node', path: Routes.Node },
            { id: 'mining', title: 'Mining', path: Routes.Mining },
          ],
        ],
      },
      {
        id: 'about-us',
        title: 'About us',
        items: [
          [
            { id: 'our-story', title: 'Our story' },
            { id: 'sponsors', title: 'Sponsors & collaborators' },
            { id: 'teachers', title: 'Teachers' },
          ],
          [
            { id: 'teachers', title: 'Teachers' },
            { id: 'support-us', title: 'Support Us' },
            { id: 'press-kit', title: 'Press Kit' },
          ],
        ] as NavigationElement[][],
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
    <header className={`${headerStyle}`}>
      {isScreenMd ? (
        isExpanded ? null : (
          <img
            className={headerSideImageStyle}
            src={headerImage}
            alt="Decouvre Bitcoin header logo"
          />
        )
      ) : (
        <MobileMenu sections={sections} />
      )}

      <img
        src={headerImage}
        className={
          isExpanded || !isScreenMd
            ? headerExpandedImageStyle
            : headerShrinkedImageStyle
        }
        alt="Decouvre Bitcoin header logo"
      />

      {isScreenMd && <MegaMenu sections={sections} />}

      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </header>
  );
};
