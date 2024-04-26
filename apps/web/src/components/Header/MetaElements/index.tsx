import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link } from '@tanstack/react-router';
// import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { trpc } from '#src/utils/trpc.js';

import SignInIcon from '../../../assets/icons/profile_log_in.png';
import { LanguageSelector } from '../LanguageSelector/index.tsx';

export interface MetaElementsProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
}

const { useGreater, useSmaller } = BreakPointHooks(breakpointsTailwind);

export const MetaElements = ({ onClickLogin }: MetaElementsProps) => {
  const { t } = useTranslation();
  const { data: session, isFetched } = trpc.user.getSession.useQuery();
  const isLoggedIn = session?.user?.uid !== undefined;
  const isMobile = useSmaller('lg');
  const isScreenLg = useGreater('md');

  return (
    <div className="flex flex-row place-items-center gap-6 md:gap-2 lg:gap-6 ml-auto max-lg:mx-auto">
      <LanguageSelector direction={isScreenLg ? 'down' : 'up'} />

      {isFetched && isLoggedIn && !isMobile && (
        <Link to="/dashboard">
          <button className="cursor-pointer text-white">
            <img src={SignInIcon} alt={t('auth.signIn')} className="size-12" />
          </button>
        </Link>
      )}

      {isFetched && isLoggedIn ? (
        <div></div>
      ) : (
        <div className="flex flex-row gap-2 lg:gap-4">
          <button className="cursor-pointer text-white" onClick={onClickLogin}>
            <img src={SignInIcon} alt={t('auth.signIn')} className="size-12" />
          </button>
        </div>
      )}
    </div>
  );
};
