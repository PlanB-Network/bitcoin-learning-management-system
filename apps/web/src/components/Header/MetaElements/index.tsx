import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { IoLogOutOutline } from 'react-icons/io5';

import SignInIcon from '../../../assets/icons/profile_log_in.png';
import { useAppDispatch, useAppSelector } from '../../../hooks/index.ts';
import { userSlice } from '../../../store/index.ts';
import { LanguageSelector } from '../LanguageSelector/index.tsx';

export interface MetaElementsProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
}

const { useGreater, useSmaller } = BreakPointHooks(breakpointsTailwind);

export const MetaElements = ({ onClickLogin }: MetaElementsProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const isMobile = useSmaller('lg');
  const isScreenLg = useGreater('md');

  return (
    <div className="flex flex-row place-items-center space-x-6 md:space-x-2 lg:space-x-6">
      <LanguageSelector direction={isScreenLg ? 'down' : 'up'} />

      {isLoggedIn && !isMobile && (
        <Link to="/dashboard">
          <button className="cursor-pointer text-white">
            <img src={SignInIcon} alt={t('auth.signIn')} className="size-12" />
          </button>
        </Link>
      )}

      {isLoggedIn ? (
        <div></div>
      ) : (
        <div className="flex flex-row space-x-2 lg:space-x-4">
          <button className="cursor-pointer text-white" onClick={onClickLogin}>
            <img src={SignInIcon} alt={t('auth.signIn')} className="size-12" />
          </button>
        </div>
      )}

      {isLoggedIn && isMobile && (
        <button
          onClick={() => {
            dispatch(userSlice.actions.logout());
            navigate({ to: '/' });
          }}
        >
          <div className="text-white">
            <IoLogOutOutline size={28} />
          </div>
        </button>
      )}
    </div>
  );
};
