import { Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import SignInIconDark from '#src/assets/icons/profile_log_in_dark.svg';
import PlanBLogoOrange from '#src/assets/logo/pba-horizontal-white.svg?react';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl } from '#src/services/user.js';

export interface MobileMenuProps {
  onClickLogin: () => void;
}

export const MobileMenu = ({ onClickLogin }: MobileMenuProps) => {
  const { t } = useTranslation();
  const { session, user } = useContext(AppContext);
  const isLoggedIn = !!session;

  const pictureUrl = getPictureUrl(user);

  return (
    <div className="flex w-full items-center justify-between lg:hidden">
      <div className="flex items-center gap-2.5">
        <Link to="/" className="w-fit">
          <PlanBLogoOrange className="h-[25px] w-auto" />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <div className="text-sm font-semibold shrink-0 min-w-8">
            <img
              src={pictureUrl ? pictureUrl : SignInIconDark}
              alt={t('auth.profile')}
              className="size-8 rounded-full"
            />
          </div>
        ) : (
          <div className="text-sm font-semibold shrink-0 min-w-8">
            <button
              type="button"
              onClick={onClickLogin}
              className="cursor-pointer text-white"
            >
              <img
                src={SignInIconDark}
                alt={t('auth.signIn')}
                className="size-8"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
