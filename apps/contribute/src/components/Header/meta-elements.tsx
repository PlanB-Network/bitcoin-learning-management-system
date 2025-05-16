import { Link, useLocation } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { IoLogOutOutline } from 'react-icons/io5';

import { Button } from '@blms/ui';

import { useGreater } from '#src/hooks/use-greater.js';
import { useSmaller } from '#src/hooks/use-smaller.js';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl } from '#src/services/user.js';
import { logout } from '#src/utils/session-utils.ts';

import SearchIconBlack from '#src/assets/icons/search-black.svg';
import SearchIcon from '#src/assets/icons/search.svg';
import SignInIconLight from '../../assets/icons/sing-in.svg';
import { LanguageSelector } from './language-selector.tsx';
import { NotificationsPanel } from './notifications-panel.tsx';

export interface MetaElementsProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
  variant?: 'light' | 'dark';
  notificationPanelVariant?: 'light' | 'dark';
}

export const MetaElements = ({
  onClickLogin,
  variant = 'dark',
  notificationPanelVariant = 'dark',
}: MetaElementsProps) => {
  const { t, i18n } = useTranslation();
  const { user, session } = useContext(AppContext);
  const location = useLocation();
  const isLoggedIn = !!session;
  const isMobile = useSmaller('lg');
  const isScreenLg = useGreater('lg');

  const pictureUrl = getPictureUrl(user);

  const isOnDashboard = location.pathname
    .replace(/^\/[a-z-]+\/?/, '')
    .startsWith('dashboard');

  return (
    <div className="flex flex-row place-items-center gap-6 md:gap-2 ml-auto max-lg:mx-auto">
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => {
          // TODO: Implement search functionality
          console.log('Search functionality not implemented yet');
        }}
      >
        <img
          className="size-6"
          src={variant === 'light' ? SearchIconBlack : SearchIcon}
          alt={t('search.search')}
        />
      </button>
      <LanguageSelector
        direction={isScreenLg ? 'down' : 'up'}
        variant={variant}
      />
      {isLoggedIn && !isMobile && (
        <>
          <NotificationsPanel
            variant={notificationPanelVariant}
            headerVariant={variant}
          />
          <Link
            className="flex"
            to="/$lang/content"
            params={{ lang: i18n.language }}
          >
            {isOnDashboard ? (
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  window.location.reload();
                }}
                className={`cursor-pointer rounded-[16px] py-[14px] px-[18px] ${
                  variant === 'light'
                    ? 'bg-darkOrange-2 text-black hover:bg-darkOrange-1 active:bg-darkOrange-1 active:text-darkOrange-5'
                    : 'bg-newBlack-3 text-white hover:bg-darkHover'
                }`}
              >
                <IoLogOutOutline size={24} />
              </button>
            ) : (
              <button type="button" className="cursor-pointer text-white">
                <img
                  src={pictureUrl ? pictureUrl : SignInIconLight}
                  alt={t('auth.signIn')}
                  className={`rounded-full ${pictureUrl ? 'size-12' : 'size-14'}`}
                />
              </button>
            )}
          </Link>
        </>
      )}

      {!isLoggedIn && (
        <div className="flex flex-row gap-2 lg:gap-4">
          <Button
            size={'loginButton'}
            variant={'loginButton'}
            className="cursor-pointer text-white"
            onClick={onClickLogin}
          >
            {t('menu.login')}
          </Button>
        </div>
      )}
    </div>
  );
};
