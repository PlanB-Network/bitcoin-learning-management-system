import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import Logo from '#src/assets/logo.png?no-inline';

interface Props {
  children?: ReactNode;
  className?: string;
}

export const PageLayout = ({ children, className }: Props) => {
  return (
    <div className="bg-black text-white">
      <div
        className={cn(
          'flex h-fit justify-center px-3 md:px-12 pb-16 md:pb-40 mx-auto w-full max-w-[1440px]',
          className,
        )}
      >
        <div className="w-full mt-12">
          <div className="flex flex-row justify-between gap-2 mb-8 display-extra-small">
            <Link to="/">
              <img className="" src={Logo} alt="" loading="lazy" />
            </Link>
            <div className="flex flew-row gap-16">
              <Link to="/">Academy</Link>
              <Link to="/hubs">Hubs</Link>
              <Link to="/funds">Funds</Link>
            </div>
            <div className="flex flew-row gap-16 text-gray-200">
              <Link to="/about">About</Link>
              <Link to="/news">News</Link>
              <span>EN</span>
            </div>
          </div>
          {children && <div>{children}</div>}
        </div>
      </div>
    </div>
  );
};
