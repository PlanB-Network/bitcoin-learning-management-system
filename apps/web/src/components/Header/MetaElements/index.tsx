import { Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { useGreater } from '#src/hooks/use-greater.js';
import { useSmaller } from '#src/hooks/use-smaller.js';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl } from '#src/services/user.js';

import SignInIconDark from '../../../assets/icons/profile_log_in_dark.svg';
import SignInIconLight from '../../../assets/icons/profile_log_in_light.svg';
import { LanguageSelector } from '../LanguageSelector/index.tsx';

export interface MetaElementsProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
  variant?: 'light' | 'dark';
}

export const MetaElements = ({
  onClickLogin,
  variant = 'dark',
}: MetaElementsProps) => {
  const { t } = useTranslation();
  const { user, session } = useContext(AppContext);
  const isLoggedIn = !!session;
  const isMobile = useSmaller('lg');
  const isScreenLg = useGreater('lg');

  const pictureUrl = getPictureUrl(user);

  return (
    <div className="flex flex-row place-items-center gap-6 md:gap-2 lg:gap-6 ml-auto max-lg:mx-auto">
      <LanguageSelector
        direction={isScreenLg ? 'down' : 'up'}
        variant={variant}
      />

      {
        <>
          {isLoggedIn && !isMobile && (
            <Link className="flex" to="/dashboard/courses">
              <button className="cursor-pointer text-white">
                <img
                  src={
                    pictureUrl
                      ? pictureUrl
                      : variant === 'light'
                        ? SignInIconLight
                        : SignInIconDark
                  }
                  alt={t('auth.signIn')}
                  className="size-12 rounded-full"
                />
              </button>
            </Link>
          )}

          {!isLoggedIn && (
            <div className="flex flex-row gap-2 lg:gap-4">
              <button
                className="cursor-pointer text-white"
                onClick={onClickLogin}
              >
                <img
                  src={variant === 'light' ? SignInIconLight : SignInIconDark}
                  alt={t('auth.signIn')}
                  className="size-12"
                />
              </button>
            </div>
          )}
        </>
      }
    </div>
  );
};
