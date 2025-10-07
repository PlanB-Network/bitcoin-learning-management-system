import { Button, cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TbCalendarMonth, TbSearch } from 'react-icons/tb';
import { useGreater } from '#src/hooks/use-greater.js';
import { useSmaller } from '#src/hooks/use-smaller.js';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl } from '#src/services/user.js';
import SignInIconBlue from '../../assets/icons/sign-in-blue.svg';
import SignInIconGreen from '../../assets/icons/sign-in-green.svg';
import SignInIconOrange from '../../assets/icons/sign-in-orange.svg';
import { LanguageSelector } from './language-selector.tsx';
import { NotificationsPanel } from './notifications-panel.tsx';

export interface MetaElementsProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
}

export const MetaElements = ({ onClickLogin }: MetaElementsProps) => {
  const { t, i18n } = useTranslation();
  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;
  const isMobile = useSmaller('lg');
  const isScreenLg = useGreater('lg');

  return (
    <div className="flex flex-row place-items-center gap-6 md:gap-4 ml-auto max-lg:mx-auto">
      <Link to={`/${i18n.language}/search`}>
        <TbSearch size={24} strokeWidth={1.5} className="text-newGray-1" />
      </Link>
      <LanguageSelector direction={isScreenLg ? 'down' : 'up'} />
      <div className="h-4.5 w-px bg-neutral-200" />
      {isLoggedIn && !isMobile && (
        <>
          <Link to={'/calendar'}>
            <TbCalendarMonth
              size={24}
              strokeWidth={1.5}
              className="text-newGray-1"
            />
          </Link>
          <NotificationsPanel />
          <UserRoleAvatar />
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
  'cursor-pointer rounded-full flex gap-2 items-center',
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

export const UserRoleAvatar = ({ isShort }: { isShort?: boolean }) => {
  const { t } = useTranslation();
  const { user } = useContext(AppContext);

  const pictureUrl = getPictureUrl(user);

  const isUserAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isUserProfessor = user?.role === 'professor';

  return (
    <Link className="flex" to="/account">
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
          isShort ? '' : 'pl-4',
        )}
      >
        {!isShort && (
          <span className="body-small-bold truncate max-w-50">
            {isUserAdmin
              ? t('words.admin')
              : isUserProfessor
                ? t('words.teacher')
                : user?.displayName}
          </span>
        )}
        <img
          src={
            pictureUrl
              ? pictureUrl
              : isUserAdmin
                ? SignInIconBlue
                : isUserProfessor
                  ? SignInIconGreen
                  : SignInIconOrange
          }
          alt={t('auth.signIn')}
          className={cn('rounded-full shrink-0', isShort ? 'size-6' : 'size-8')}
        />
      </button>
    </Link>
  );
};
