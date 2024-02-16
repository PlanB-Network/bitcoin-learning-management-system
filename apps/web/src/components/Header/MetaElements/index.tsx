import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { IoLogOutOutline } from 'react-icons/io5';

import { Button } from '../../../atoms/Button/index.tsx';
import { useAppDispatch, useAppSelector } from '../../../hooks/index.ts';
import { userSlice } from '../../../store/index.ts';
import { LanguageSelector } from '../LanguageSelector/index.tsx';

export interface MetaElementsProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
}

const { useGreater, useSmaller } = BreakPointHooks(breakpointsTailwind);

export const MetaElements = ({
  onClickRegister,
  onClickLogin,
}: MetaElementsProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const isMobile = useSmaller('lg');
  const isScreenLg = useGreater('md');
  const isScreenXl = useGreater('lg');

  const buttonSize = isScreenXl || isMobile ? 'm' : 's';

  return (
    <div className="flex flex-row place-items-center space-x-6 md:space-x-2 lg:space-x-6">
      <LanguageSelector direction={isScreenLg ? 'down' : 'up'} />

      {isLoggedIn && !isMobile && (
        <Link to="/dashboard">
          <Button className="my-4" variant="tertiary" rounded size={buttonSize}>
            {t('words.dashboard')}
          </Button>
        </Link>
      )}

      {isLoggedIn ? (
        <div></div>
      ) : (
        <div className="flex flex-row space-x-2 lg:space-x-4">
          <Button
            className="my-4"
            variant="tertiary"
            rounded
            onClick={onClickLogin}
            size={buttonSize}
          >
            {t('auth.signIn')}
          </Button>
        </div>
      )}

      {isLoggedIn && isMobile && (
        <div
          className="text-white"
          onClick={() => {
            dispatch(userSlice.actions.logout());
            navigate({ to: '/' });
          }}
        >
          <IoLogOutOutline size={28} />
        </div>
      )}
    </div>
  );
};
