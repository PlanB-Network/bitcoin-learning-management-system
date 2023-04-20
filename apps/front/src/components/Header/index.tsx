import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import headerImage from '../../assets/db-academy-header-1.png';
import libraryIcon from '../../assets/navigation-icons/library.png';
import { useDisclosure } from '../../hooks';
import { AuthModal } from '../AuthModal';

import {
  headerExpandedImageStyle,
  headerShrinkedImageStyle,
  headerSideImageStyle,
  headerStyle,
} from './index.css';
import { MegaMenu } from './MegaMenu';

export interface HeaderProps {
  isExpanded: boolean;
}

export const Header = ({ isExpanded }: HeaderProps) => {
  const navigate = useNavigate();
  const {
    open: openLoginModal,
    isOpen: isLoginModalOpen,
    close: closeLoginModal,
  } = useDisclosure();

  const sections = useMemo(
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
                { id: 'btc-101', title: 'BTC 101' },
                { id: 'ln-101', title: 'LN 101' },
                { id: 'econ-101', title: 'ECON 101' },
                { id: 'fin-101', title: 'FIN 101' },
                { id: 'secu-101', title: 'SECU 101' },
              ],
            ],
          },
          {
            id: 'annee-2',
            title: '2nde année',
            items: [
              [
                { id: 'btc-201', title: 'BTC 201' },
                { id: 'btc-204', title: 'BTC 204' },
                { id: 'econ-201', title: 'ECON 201' },
                { id: 'ln-201', title: 'LN 201' },
              ],
              [
                { id: 'ln-202', title: 'LN 202' },
                { id: 'btc-205', title: 'BTC 205' },
                { id: 'econ-203', title: 'ECON 203' },
              ],
            ],
          },
          {
            id: 'annee-3',
            title: '3ème année',
            items: [
              [
                { id: 'crypto-301', title: 'CRYPTO 301' },
                { id: 'seco-301', title: 'SECU 301' },
                { id: 'fin-301', title: 'FIN 301' },
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
                },
                { id: 'newsletter', title: 'Newsletter' },
                { id: 'artiste', title: 'Artiste' },
              ],
              [
                { id: 'business', title: 'Business' },
                { id: 'citation', title: 'Citation' },
                { id: 'bips', title: 'BIPs' },
              ],
              [
                { id: 'lexique', title: 'Lexique' },
                { id: 'bitcoin-calendar', title: 'Bitcoin Calendar' },
                { id: 'articles', title: 'Articles' },
                { id: 'learning', title: 'Learning tools' },
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
            { id: 'wallets', title: 'Wallets' },
            { id: 'exchanges', title: 'Exchanges' },
            { id: 'lightning', title: 'Lightning' },
            { id: 'ordinals', title: 'Ordinals' },
          ],
          [
            { id: 'business', title: 'Business' },
            { id: 'node', title: 'Node' },
            { id: 'mining', title: 'Mining' },
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
        ],
      },
      {
        id: 'account',
        title: 'Account',
        action: () => {
          openLoginModal();
        },
      },
    ],
    [openLoginModal]
  );

  return (
    <header className={`${headerStyle}`}>
      {!isExpanded && (
        <img
          className={headerSideImageStyle}
          src={headerImage}
          alt="Decouvre Bitcoin header logo"
        />
      )}
      <img
        src={headerImage}
        className={
          isExpanded ? headerExpandedImageStyle : headerShrinkedImageStyle
        }
        alt="Decouvre Bitcoin header logo"
      />

      <MegaMenu sections={sections} />

      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </header>
  );
};
