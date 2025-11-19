import { cn } from '@blms/ui';
import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbDotsVertical } from 'react-icons/tb';

export interface Tab {
  id: string;
  label: string;
  href: string;
}

export const SecondaryNavbar = ({ tabs }: { tabs: Tab[] }) => {
  if (tabs.length === 0) return null;

  return (
    <>
      <div className="hidden lg:block w-full">
        <SecondaryNavbarDesktop tabs={tabs} />
      </div>
      <div className="block lg:hidden w-full">
        <SecondaryNavbarMobile tabs={tabs} />
      </div>
    </>
  );
};

const SecondaryNavbarDesktop = ({ tabs }: { tabs: Tab[] }) => {
  const { t, i18n } = useTranslation();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const [overflowIndex, setOverflowIndex] = useState(tabs.length);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLElement | null)[]>([]);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    const calculateTabs = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const moreButtonWidth = 60;
      let totalWidth = 0;
      let newOverflowIndex = tabs.length;

      for (let i = 0; i < tabs.length; i++) {
        const tabWidth = tabRefs.current[i]?.offsetWidth || 0;

        if (totalWidth + tabWidth > containerWidth - moreButtonWidth) {
          newOverflowIndex = i;
          break;
        }
        totalWidth += tabWidth + 24;
      }

      if (newOverflowIndex !== overflowIndex) {
        setOverflowIndex(newOverflowIndex);
      }
    };

    tabRefs.current = tabRefs.current.slice(0, tabs.length);
    calculateTabs();

    window.addEventListener('resize', calculateTabs);
    return () => window.removeEventListener('resize', calculateTabs);
  }, [tabs, overflowIndex]);

  useEffect(() => {
    if (!isPopoverOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        toggleRef.current &&
        !toggleRef.current.contains(target)
      ) {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isPopoverOpen]);

  useEffect(() => {
    setIsPopoverOpen(false);
  }, [pathname]);

  const activeTab = tabs.reduce<Tab | null>((best, tab) => {
    const tabPath = `/${i18n.language}${tab.href}`;

    if (tab.id === 'courseChapter') {
      const chapterPathPattern = new RegExp(
        `^/${i18n.language}/courses/[0-9a-fA-F-]{36}/[a-z0-9-]+-[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}(?:/|$)`,
      );
      if (chapterPathPattern.test(pathname)) return tab;
    }

    if (pathname === tabPath || pathname.startsWith(tabPath + '/')) {
      if (!best || tabPath.length > `/${i18n.language}${best.href}`.length) {
        return tab;
      }
    }
    return best;
  }, null);

  const visibleTabs = tabs.slice(0, overflowIndex);
  const overflowTabs = tabs.slice(overflowIndex);

  return (
    <div
      className="w-full flex items-center border-b border-neutral-100 px-6 pt-3.5 relative"
      role="tablist"
      ref={containerRef}
    >
      {/* Do not remove - necessary for overflow behavior */}
      <div className="absolute opacity-0 -z-50 overflow-hidden gap-6">
        {tabs.map((tab, index) => (
          <span
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            className="label-strong text-nowrap"
          >
            {t(tab.label)}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-6">
        {visibleTabs.map((tab) => {
          const isActive = activeTab?.id === tab.id;

          return (
            <Link
              key={tab.id}
              to={tab.href}
              className={cn(
                'relative pb-2 group text-nowrap',
                isActive
                  ? 'text-newBlack-1 label-strong'
                  : 'label text-newBlack-3 group-hover:text-newBlack-1',
              )}
            >
              {t(tab.label)}
              <div
                className={cn(
                  'absolute bottom-0 left-0 h-1 w-full rounded-full bg-orange-100 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-75',
                  isActive && 'scale-x-100 bg-orange-500',
                )}
              />
            </Link>
          );
        })}

        {overflowTabs.length > 0 && (
          <div className="relative">
            <button
              ref={toggleRef}
              onClick={() => setIsPopoverOpen((s) => !s)}
              aria-haspopup="menu"
              aria-expanded={isPopoverOpen}
              className="mb-2"
              type="button"
            >
              <TbDotsVertical
                size={16}
                className="text-newBlack-3 hover:text-newBlack-1 hover:cursor-pointer"
              />
            </button>

            {isPopoverOpen && (
              <div
                ref={popoverRef}
                className="w-fit absolute top-full -right-3 bg-white border border-neutral-100 rounded-lg z-10 p-2 flex flex-col"
                role="menu"
              >
                {overflowTabs.map((tab) => {
                  const isActive = activeTab?.id === tab.id;
                  return (
                    <Link
                      key={tab.id}
                      to={tab.href}
                      onClick={() => setIsPopoverOpen(false)}
                      className={cn(
                        'text-nowrap pl-2.5 py-2 relative group',
                        isActive
                          ? 'text-newBlack-1 label-strong'
                          : 'label text-newBlack-3 group-hover:text-newBlack-1',
                      )}
                    >
                      {t(tab.label)}
                      <div
                        className={cn(
                          'absolute left-0 top-0 h-6 my-2 w-1 rounded-full bg-orange-100 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-75',
                          isActive && 'scale-y-100 bg-orange-500',
                        )}
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SecondaryNavbarMobile = ({ tabs }: { tabs: Tab[] }) => {
  const { t, i18n } = useTranslation();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const activeTab = tabs.reduce<Tab | null>((best, tab) => {
    const tabPath = `/${i18n.language}${tab.href}`;
    if (pathname === tabPath || pathname.startsWith(tabPath + '/')) {
      if (!best || tabPath.length > `/${i18n.language}${best.href}`.length) {
        return tab;
      }
    }
    return best;
  }, null);

  const elRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const preventClick = useRef(false);

  const checkScroll = () => {
    const el = elRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = elRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [tabs]);

  useEffect(() => {
    const el = elRef.current;
    if (!el || !activeTab) return;

    const activeTabEl = el.querySelector(
      `a[href='${activeTab.href}']`,
    ) as HTMLElement | null;
    if (!activeTabEl) return;

    const elRect = el.getBoundingClientRect();
    const tabRect = activeTabEl.getBoundingClientRect();

    const tabCenter = tabRect.left + tabRect.width / 2;
    const elCenter = elRect.left + elRect.width / 2;
    const scrollOffset = tabCenter - elCenter;

    el.scrollBy({
      left: scrollOffset,
    });
  }, [activeTab]);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = elRef.current;
    if (!el) return;

    preventClick.current = false;

    dragging.current = true;
    moved.current = false;
    startX.current = e.clientX;
    startScroll.current = el.scrollLeft;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = elRef.current;
    if (!el || !dragging.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 5) moved.current = true;
    el.scrollLeft = startScroll.current - dx;
  };

  const endDrag = (e: React.PointerEvent) => {
    if (dragging.current && moved.current) {
      preventClick.current = true;
    }
    dragging.current = false;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (preventClick.current) {
      e.stopPropagation();
      e.preventDefault();
      preventClick.current = false;
    }
  };

  return (
    <div className="w-full relative">
      {canScrollLeft && (
        <div className="pointer-events-none absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-white to-transparent z-10" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10" />
      )}
      <div
        className="w-full flex items-center border-b border-neutral-100 px-3 pt-2 gap-4.5 overflow-x-scroll no-scrollbar cursor-grab active:cursor-grabbing select-none"
        role="tablist"
        ref={elRef}
        style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
      >
        {tabs.map((tab) => {
          const isActive = activeTab?.id === tab.id;

          return (
            <Link
              key={tab.id}
              to={tab.href}
              className={cn(
                'relative pb-2 group text-nowrap',
                isActive
                  ? 'text-newBlack-1 body-base-bold'
                  : 'body-base text-newBlack-3 group-hover:text-newBlack-1',
              )}
              onDragStart={(e: React.DragEvent) => e.preventDefault()}
            >
              {t(tab.label)}
              <div
                className={cn(
                  'absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-orange-100 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-75',
                  isActive && 'scale-x-100 bg-orange-500',
                )}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
