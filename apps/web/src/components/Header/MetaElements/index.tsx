import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';
import { IoLogOutOutline } from 'react-icons/io5';
import { Link, useNavigate } from '@tanstack/react-router';

import { Button } from '../../../atoms/Button';
import { LanguageSelector } from '../LanguageSelector';
import { useAppDispatch, useAppSelector } from '../../../hooks';

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
  const isMobile = useSmaller('md');
  const isScreenLg = useGreater('md');
  const isScreenXl = useGreater('lg');

  const buttonSize = isScreenXl || isMobile ? 'm' : 's';

  return (
    <div className="flex flex-row place-items-center space-x-6 md:space-x-2 lg:space-x-6">
      <LanguageSelector direction={isScreenLg ? 'down' : 'up'} />

      {isLoggedIn ? (
        <Button className="my-4" variant="tertiary" rounded size={buttonSize}>
          <span>{t('words.dashboard')}</span>
          {/* @ts-ignore */}
          <Link to="/dashboard">{t('words.dashboard')}</Link>
        </Button>
      ) : (
        <div className="flex flex-row space-x-2 lg:space-x-4">
          <Button
            className="my-4"
            variant="tertiary"
            rounded
            onClick={onClickLogin}
            size={buttonSize}
          >
            {t('words.signIn')}
          </Button>
          <Button
            className="my-4"
            rounded
            onClick={onClickRegister}
            size={buttonSize}
          >
            {t('words.register')}
          </Button>
        </div>
      )}

      {isLoggedIn && isMobile && (
        <div
          className="text-white"
          // TODO TRIGGERonClick={() => {
          //   dispatch(userSlice.actions.logout());
          //   navigate('/');
          // }}
        >
          <IoLogOutOutline size={28} />
        </div>
      )}
    </div>
  );
};
