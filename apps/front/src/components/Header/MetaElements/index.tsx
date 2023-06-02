import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';

import { Button } from '../../../atoms/Button';
import { useAppSelector } from '../../../hooks';
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
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const isScreenMd = useGreater('md');

  return (
    <div className="flex flex-row place-items-center space-x-6">
      <LanguageSelector direction={isScreenMd ? 'down' : 'up'} />

      {isLoggedIn ? (
        <div className="text-white">Account</div>
      ) : (
        <div className="flex flex-row space-x-4">
          <Button
            className="my-4"
            variant="tertiary"
            rounded
            onClick={onClickLogin}
          >
            Register
          </Button>
          <Button className="my-4" rounded onClick={onClickRegister}>
            Login
          </Button>
        </div>
      )}
    </div>
  );
};
