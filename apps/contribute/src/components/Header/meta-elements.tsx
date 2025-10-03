import { Button } from '@blms/ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useSmaller } from '#src/hooks/use-smaller.js';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl } from '#src/services/user.js';
import SignInIconLight from '../../assets/icons/sing-in.svg';

export interface MetaElementsProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
  variant?: 'light' | 'dark';
  notificationPanelVariant?: 'light' | 'dark';
}

export const MetaElements = ({ onClickLogin }: MetaElementsProps) => {
  const { t, i18n: _i18n } = useTranslation();
  const { user, session } = useContext(AppContext);
  const isLoggedIn = !!session;
  const isMobile = useSmaller('lg');

  const pictureUrl = getPictureUrl(user);

  return (
    <div className="flex flex-row place-items-center gap-6 md:gap-2 ml-auto max-lg:mx-auto">
      <div className="w-2" />
      {isLoggedIn && !isMobile && (
        <div className="flex">
          <button type="button" className="cursor-pointer text-white">
            <img
              src={pictureUrl ? pictureUrl : SignInIconLight}
              alt={t('auth.signIn')}
              className={`rounded-full ${pictureUrl ? 'size-12' : 'size-14'}`}
            />
          </button>
        </div>
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
