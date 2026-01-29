import { cn, ScrollToTopButton } from '@blms/ui';
import {
  type JSX,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppContext } from '#src/providers/context.tsx';
import { isPearApp } from '../env.ts';
import { Footer } from './footer.tsx';
import { Header } from './Header/header.tsx';
import { SideBarContent } from './sidebar-content.tsx';

interface MainLayoutProps {
  children: JSX.Element | JSX.Element[];
  showFooter?: boolean;
  showBecomeTeacherButton?: boolean;
  navbarTitle?: ReactNode;
}

export const MainLayout = ({
  children,
  showFooter = true,
  showBecomeTeacherButton,
  navbarTitle,
}: MainLayoutProps) => {
  const { isSidebarOpen, setIsSidebarOpen } = useContext(AppContext);

  const [isResizing, setIsResizing] = useState(false);

  const resizeTimerRef = useRef<number | null>(null);

  // handle resize to avoid transition lag
  useEffect(() => {
    const onResize = () => {
      setIsResizing(true);

      if (resizeTimerRef.current) {
        window.clearTimeout(resizeTimerRef.current);
      }
      resizeTimerRef.current = window.setTimeout(() => {
        setIsResizing(false);
        resizeTimerRef.current = null;
      }, 120);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (resizeTimerRef.current) window.clearTimeout(resizeTimerRef.current);
    };
  }, []);

  const closedMargin = 'lg:ml-[86px]';
  const openMargin = 'lg:ml-[276px]';

  return (
    <div className="flex flex-col bg-header w-full mx-auto relative">
      {/* Display titlebar on pear app */}
      {isPearApp ? (
        <div
          id="pear-ctrl-container"
          className="fixed top-0 left-0 w-full pt-4 pb-5 px-2 bg-[#ff5c00c3] z-50"
        >
          <pear-ctrl />
        </div>
      ) : null}

      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        navbarTitle={navbarTitle}
      />

      <div className="flex w-full grow overflow-hidden">
        {/* Sidebar */}
        <SideBarContent
          isSidebarOpen={isSidebarOpen}
          className="max-lg:hidden"
        />

        {/* Rounded border illusion hack */}
        {/* Left */}
        <div
          className={cn(
            'hidden lg:block fixed top-18 w-6 h-6 z-50',
            isSidebarOpen ? 'left-[276px]' : 'left-[86px]',
            isResizing ? 'transition-none' : 'transition-all ease-in-out',
          )}
          style={{
            willChange: 'left',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="hide-if-pear w-full h-full fill-header"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M0 0 H24 V24 H0 Z M0 24 A24 24 0 0 1 24 0 L24 24 Z"
            />
          </svg>
        </div>
        {/* Right */}
        <div
          className={cn(
            'hidden lg:block fixed top-18 w-6 h-6 z-50 -scale-x-100 right-0',
          )}
          style={{
            willChange: 'right',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="hide-if-pear w-full h-full fill-header"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M0 0 H24 V24 H0 Z M0 24 A24 24 0 0 1 24 0 L24 24 Z"
            />
          </svg>
        </div>

        {/* Main frame */}
        <div
          className={cn(
            'flex flex-col w-full overflow-hidden transition-all ease-in-out mt-15 lg:mt-18',
            isSidebarOpen ? openMargin : closedMargin,
          )}
          style={{ willChange: 'margin-left' }}
        >
          <main className="mt-if-pear flex grow flex-col bg-white min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-72px)] w-full relative">
            {children}
          </main>
          {showFooter && (
            <Footer showBecomeTeacherButton={showBecomeTeacherButton} />
          )}

          <ScrollToTopButton />
        </div>
      </div>
    </div>
  );
};
