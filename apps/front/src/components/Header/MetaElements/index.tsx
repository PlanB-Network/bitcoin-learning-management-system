import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
// import { useTranslation } from 'react-i18next';

// import { Button } from '../../../atoms/Button';
// import { useAppSelector } from '../../../hooks';
import { LanguageSelector } from '../LanguageSelector';

export interface MetaElementsProps {
  onClickLogin: () => void;
  onClickRegister: () => void;
}

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const MetaElements = ({
  onClickRegister,
  onClickLogin,
}: MetaElementsProps) => {
  // const { t } = useTranslation();
  // const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const isScreenLg = useGreater('md');
  // const isScreenXl = useGreater('lg');

  return (
    <div className="flex flex-row place-items-center space-x-2 lg:space-x-6">
      <LanguageSelector direction={isScreenLg ? 'down' : 'up'} />

      {/* {isLoggedIn ? (
        <div className="text-white">{t('words.account')}</div>
      ) : (
        <div className="flex flex-row space-x-2 lg:space-x-4">
          <Button
            className="my-4"
            variant="tertiary"
            rounded
            onClick={onClickLogin}
            size={isScreenXl ? 'm' : 's'}
          >
            {t('words.register')}
          </Button>
          <Button
            className="my-4"
            rounded
            onClick={onClickRegister}
            size={isScreenXl ? 'm' : 's'}
          >
            {t('words.login')}
          </Button>
        </div>
      )} */}
    </div>
  );
};
