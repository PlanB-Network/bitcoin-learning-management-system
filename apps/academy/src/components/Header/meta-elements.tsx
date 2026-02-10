import {
  Button,
  cn,
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TbCalendarMonth, TbSearch } from 'react-icons/tb';
import { useGreater } from '#src/hooks/use-greater.js';
import { useSmaller } from '#src/hooks/use-smaller.js';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl } from '#src/services/user.js';
import { resourceImgUrl } from '#src/utils/index.js';
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
        <TbSearch size={24} strokeWidth={1.5} className="text-neutral-500" />
      </Link>
      <LanguageSelector direction={isScreenLg ? 'down' : 'up'} />
      <div className="h-4.5 w-px bg-neutral-200" />
      {isLoggedIn && !isMobile && (
        <>
          <Link to={'/calendar'}>
            <TbCalendarMonth
              size={24}
              strokeWidth={1.5}
              className="text-neutral-500"
            />
          </Link>
          <NotificationsPanel />
          <div className="flex items-center gap-0.5">
            <CommunityLogo />
            <UserRoleAvatar />
          </div>
        </>
      )}

      {!isLoggedIn && (
        <div className="flex flex-row gap-2 lg:gap-4">
          <Button size={'s'} variant={'primary'} rounded onClick={onClickLogin}>
            {t('menu.signIn')}
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

export const UserRoleAvatar = ({
  isShort,
  className,
}: {
  isShort?: boolean;
  className?: string;
}) => {
  const { t } = useTranslation();
  const { user } = useContext(AppContext);

  const pictureUrl = getPictureUrl(user);

  const isUserAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isUserProfessor = user?.role === 'professor';

  return (
    <Link className={cn('flex', className)} to="/account">
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
          <span className="body-small-bold truncate max-w-28 lg:max-w-50">
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

const CommunityLogo = () => {
  const { t } = useTranslation();
  const { user } = useContext(AppContext);

  if (!user?.communityId || !user.communityName || !user.communityPath) {
    return null;
  }

  const communityLogoUrl = resourceImgUrl(
    {
      path: user.communityPath,
      lastCommit: user.communityLastCommit || '',
    },
    'logo.webp',
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            to={`/resources/projects/${user.communityId}`}
            className="flex items-center"
          >
            <img
              src={communityLogoUrl}
              alt={user.communityName}
              className="size-8 rounded-full shrink-0 object-cover"
            />
          </Link>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={5}
          side={'bottom'}
          className={
            'flex flex-col items-center shadow-none! text-xs! w-fit px-3! text-start bg-yellow-50 rounded-full border-0!'
          }
        >
          <TooltipArrow className="fill-yellow-50" width={9} height={7} />
          <span className="text-xs">
            {t('resources.projects.memberOf', {
              communityName: user.communityName,
            })}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
