import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { TbMenu2, TbX } from 'react-icons/tb';
import Logo from '#src/assets/logo.png?no-inline';

export interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export const MobileMenu = ({
  isMobileMenuOpen,
  toggleMobileMenu,
}: MobileMenuProps) => {
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!mobileMenuRef.current || !isMobileMenuOpen) return;

      if (
        mobileMenuRef.current.contains(target) ||
        target?.closest('[data-popover-content]')
      ) {
        return;
      }

      toggleMobileMenu();
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, toggleMobileMenu]);

  return (
    <>
      <div className="flex w-full items-center justify-between lg:hidden px-2">
        <Link to="/" className="w-fit">
          <img className="my-4 h-8 w-auto" src={Logo} alt="" loading="lazy" />
        </Link>

        <div className="flex items-center gap-2">
          <TbMenu2
            onClick={toggleMobileMenu}
            className="cursor-pointer text-neutral-500 stroke-2 size-8 shrink-0"
          />
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed top-0 left-0 w-full h-dvh bg-neutral-400/80 z-10 lg:hidden" />
      )}

      <nav
        className={cn(
          'flex flex-col fixed top-0 right-0 items-center w-full max-w-[327px] h-dvh duration-300 overflow-scroll no-scrollbar lg:hidden bg-header p-5 pt-3 z-20',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        ref={mobileMenuRef}
      >
        <div className="ml-auto mb-6 flex items-center gap-2">
          <TbX
            onClick={toggleMobileMenu}
            className="cursor-pointer text-neutral-500 stroke-2 size-8 shrink-0"
          />
        </div>
        {/* <SideBar isSidebarOpen={true} /> */}
      </nav>
    </>
  );
};
