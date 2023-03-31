import { Menubar } from 'primereact/menubar';
import { MenuItem } from 'primereact/menuitem';
import { useMemo } from 'react';
import { CiBeerMugFull } from 'react-icons/ci';
import { useNavigate } from 'react-router';

import headerImage from '../../assets/db-academy-header-1.png';
import franceFlag from '../../assets/france.png';
import spainFlag from '../../assets/spain.png';
import unitedKingdomFlag from '../../assets/united-kingdom.png';
import { useDisclosure } from '../../hooks';
import { AuthModal } from '../AuthModal';

import {
  headerExpandedImageStyle,
  headerMenuStyle,
  headerShrinkedImageStyle,
  headerSideImageStyle,
  headerStyle,
} from './index.css';

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

  const items: MenuItem[] = useMemo(
    () => [
      {
        label: 'Accueil',
        className: 'menu-primary',
        command: () => {
          navigate('/');
        },
      },
      {
        label: 'Cours',
        icon: 'pi pi-fw pi-book',
        className: 'menu-primary',
        items: [
          {
            label: '1ère Année',
            items: [{ label: 'BTC 101' }, { label: 'BTC 102' }],
          },
          {
            label: '2nde Année',
            items: [
              { label: 'BTC 201' },
              { label: 'ECON 201' },
              { label: 'LN 201' },
              { label: 'LN 202' },
              { label: 'BTC 205' },
            ],
          },
          {
            label: '3ème Année',
            items: [{ label: 'CRYPTO 301' }],
          },
        ],
      },
      {
        label: 'Professeurs',
        icon: 'pi pi-fw pi-users',
        className: 'menu-primary',
        items: [
          {
            label: 'Rogzy',
          },
          {
            label: 'Fanis Michalakis',
          },
          {
            label: 'Théo Mogenet',
          },
          {
            label: 'Loïc Morel',
          },
          {
            label: 'Pierre',
          },
        ],
      },
      {
        label: 'Le Projet',
        className: 'menu-primary',
      },
      {
        label: 'Projets Annexes',
        className: 'menu-primary',
        items: [
          {
            label: 'Site principal',
            icon: 'pi pi-fw pi-home',
          },
          {
            label: 'Podcast',
            icon: 'pi pi-fw pi-microphone',
          },
          {
            label: 'Meetups Bitcoin',
            icon: (
              <CiBeerMugFull
                style={{
                  marginLeft: '4px',
                  marginRight: '8px',
                  color: 'var(--text-color-secondary)',
                }}
              />
            ),
          },
        ],
      },
      {
        label: 'Connection',
        icon: 'pi pi-fw pi-sign-in',
        className: 'menu-primary',
        items: [
          {
            label: 'Standard',
            command: () => {
              openLoginModal();
            },
          },
          {
            label: 'Avec LN',
          },
        ],
      },
      {
        label: 'Langue',
        className: 'menu-primary',
        items: [
          {
            label: 'Français',
            icon: (
              <img
                style={{ height: '20px', marginRight: '15px' }}
                src={franceFlag}
                alt="France flag"
              />
            ),
          },
          {
            label: 'English',
            icon: (
              <img
                style={{ height: '20px', marginRight: '15px' }}
                src={unitedKingdomFlag}
                alt="UK flag"
              />
            ),
          },
          {
            label: 'Espagnol',
            icon: (
              <img
                style={{ height: '20px', marginRight: '15px' }}
                src={spainFlag}
                alt="Spain flag"
              />
            ),
          },
        ],
      },
    ],
    [navigate, openLoginModal]
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

      <Menubar
        className={headerMenuStyle}
        style={{ marginTop: isExpanded ? '20px' : '0px' }}
        model={items}
      />

      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </header>
  );
};
