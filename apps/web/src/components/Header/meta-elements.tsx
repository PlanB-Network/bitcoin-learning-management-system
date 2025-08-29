import { Button, cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TbLogout, TbSearch } from 'react-icons/tb';
import { useGreater } from '#src/hooks/use-greater.js';
import { useSmaller } from '#src/hooks/use-smaller.js';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl } from '#src/services/user.js';
import { logout } from '#src/utils/session-utils.ts';
import SignInIconLight from '../../assets/icons/profile_log_in.svg';
import SignInIconBlue from '../../assets/icons/sign-in-blue.svg';
import SignInIconGreen from '../../assets/icons/sign-in-green.svg';
import { LanguageSelector } from './language-selector.tsx';
import { NotificationsPanel } from './notifications-panel.tsx';

export interface MetaElementsProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
}

export const MetaElements = ({ onClickLogin }: MetaElementsProps) => {
  const { t, i18n } = useTranslation();
  const { user, session } = useContext(AppContext);
  const isLoggedIn = !!session;
  const isMobile = useSmaller('lg');
  const isScreenLg = useGreater('lg');

  const pictureUrl = getPictureUrl(user);

  const isUserAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isUserProfessor = user?.role === 'professor';

  return (
    <div className="flex flex-row place-items-center gap-6 md:gap-4 ml-auto max-lg:mx-auto">
      <Link className="cursor-pointer" to={`/${i18n.language}/search`}>
        <TbSearch size={24} className="text-newGray-1" />
      </Link>
      <LanguageSelector direction={isScreenLg ? 'down' : 'up'} />
      <div className="h-4.5 w-px bg-neutral-200" />
      {isLoggedIn && !isMobile && (
        <>
          <NotificationsPanel />
          <Link className="flex gap-2" to="/dashboard/profile">
            <button
              type="button"
              className={cn(
                userRoleAvatarVariants({
                  variant: isUserAdmin
                    ? 'blue'
                    : isUserProfessor
                      ? 'green'
                      : 'orange',
                }),
              )}
            >
              <span className="body-14px-medium truncate max-w-50">
                {isUserAdmin
                  ? t('words.admin')
                  : isUserProfessor
                    ? t('words.teacher')
                    : user?.displayName}
              </span>
              <img
                src={
                  pictureUrl
                    ? pictureUrl
                    : isUserAdmin
                      ? SignInIconBlue
                      : isUserProfessor
                        ? SignInIconGreen
                        : SignInIconLight
                }
                alt={t('auth.signIn')}
                className={'rounded-full size-8'}
              />
            </button>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await logout();
            }}
            className={'cursor-pointer text-newGray-1'}
          >
            <TbLogout size={24} />
          </button>
        </>
      )}

      {!isLoggedIn && (
        <div className="flex flex-row gap-2 lg:gap-4">
          <Button
            size={'s'}
            variant={'primary'}
            rounded
            onClick={onClickLogin}
            className="shadow-none"
          >
            {t('menu.login')}
          </Button>
        </div>
      )}
    </div>
  );
};

const userRoleAvatarVariants = cva(
  'cursor-pointer rounded-full pl-4 flex gap-2 items-center',
  {
    defaultVariants: {
      variant: 'orange',
    },
    variants: {
      variant: {
        orange: 'bg-orange-50 text-orange-800',
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-50 text-blue-800',
      },
    },
  },
);
