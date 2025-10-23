import { cn, Loader } from '@blms/ui';
import {
  Fragment,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { TbNotebook } from 'react-icons/tb';
import { buildTutorialTocFromMarkdown, makeAnchorKey } from '../-utils/toc.ts';

const TutorialsMarkdownBody = lazy(
  () => import('#src/components/Markdown/tutorials-markdown-body.js'),
);

const SCROLL_OFFSET = 140;

export default function TutorialWithTOC({
  rawContent,
  assetPrefix,
}: {
  rawContent: string;
  assetPrefix?: string;
}) {
  const { t } = useTranslation();

  const toc = useMemo(
    () => buildTutorialTocFromMarkdown(rawContent),
    [rawContent],
  );

  const contentRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  const [isFixed, setIsFixed] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const [activeKey, setActiveKey] = useState<string | null>(
    toc[0]?.key ?? null,
  );

  const activeKeyRef = useRef<string | null>(activeKey);
  const headingsRef = useRef<HTMLHeadingElement[]>([]);
  const tickingRef = useRef(false);

  useEffect(() => {
    activeKeyRef.current = activeKey;
  }, [activeKey]);

  useEffect(() => {
    const scanHeadings = () => {
      const el = contentRef.current;
      if (!el) {
        headingsRef.current = [];
        return;
      }
      const headings = Array.from(
        el.querySelectorAll('#tutorial-content h2'),
      ) as HTMLHeadingElement[];

      headings.forEach((h, idx) => {
        if (!h.id) {
          const key =
            toc[idx]?.key ?? makeAnchorKey(h.textContent ?? `heading-${idx}`);
          h.id = key;
        }
      });

      headingsRef.current = headings;
    };

    const updateActive = () => {
      const headings = headingsRef.current;
      if (!headings || headings.length === 0) {
        tickingRef.current = false;
        return;
      }

      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;

      if (scrollY + viewportHeight >= document.body.scrollHeight - 10) {
        const lastId = headings[headings.length - 1]?.id ?? null;
        if (lastId && lastId !== activeKeyRef.current) {
          setActiveKey(lastId);
        }
        tickingRef.current = false;
        return;
      }

      let newActiveId: string | null = null;
      for (let i = headings.length - 1; i >= 0; i--) {
        const h = headings[i];
        const rect = h.getBoundingClientRect();
        if (rect.top <= SCROLL_OFFSET + 10) {
          newActiveId = h.id;
          break;
        }
      }

      if (!newActiveId) {
        newActiveId = headings[0].id;
      }

      if (newActiveId !== activeKeyRef.current) {
        setActiveKey(newActiveId);
      }

      tickingRef.current = false;
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(updateActive);
      }
    };

    const onResize = () => {
      requestAnimationFrame(() => {
        updateActive();
      });
    };

    const el = contentRef.current;
    const observer = new MutationObserver(() => {
      scanHeadings();
      requestAnimationFrame(updateActive);
    });

    if (el) {
      scanHeadings();
      requestAnimationFrame(updateActive);

      observer.observe(el, { childList: true, subtree: true });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [rawContent, toc]);

  useEffect(() => {
    const topObserver = new IntersectionObserver(
      ([entry]) => setIsFixed(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-120px 0px 0px 0px' },
    );

    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        const bounding = entry.boundingClientRect;
        const viewportHeight = window.innerHeight;
        const isBelowBottom =
          bounding.top < viewportHeight && bounding.bottom < 0;

        setIsAtBottom(entry.isIntersecting || isBelowBottom);
      },
      { threshold: 0, rootMargin: '0px 0px -60% 0px' },
    );

    if (topSentinelRef.current) topObserver.observe(topSentinelRef.current);
    if (bottomSentinelRef.current)
      bottomObserver.observe(bottomSentinelRef.current);

    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, []);

  const handleClick = (key: string) => {
    const target = document.getElementById(key);
    if (target) {
      const rect = target.getBoundingClientRect();
      const top = window.scrollY + rect.top - SCROLL_OFFSET;
      window.scrollTo({ top });
      setActiveKey(key);
    }
  };

  const MemoizedMarkdown = useMemo(
    () => (
      <TutorialsMarkdownBody
        content={rawContent}
        assetPrefix={assetPrefix ?? ''}
      />
    ),
    [rawContent, assetPrefix],
  );

  return (
    <>
      <div ref={topSentinelRef} className="h-0" />
      <div className="w-full flex relative">
        <div
          ref={contentRef}
          id="tutorial-content"
          className="wrap-break-word overflow-hidden w-full space-y-4 md:space-y-6"
        >
          <Suspense fallback={<Loader size={'s'} />}>
            {MemoizedMarkdown}
          </Suspense>
          <div ref={bottomSentinelRef} className="h-0" />
        </div>

        {toc.length > 0 && (
          <div className="ml-8 w-50 shrink-0 max-lg:hidden">
            <aside
              className={cn(
                'flex flex-col gap-2 shrink-0 w-50 transition-transform',
                isFixed && !isAtBottom ? 'fixed top-32' : 'relative',
              )}
            >
              <h3 className="flex gap-1 items-center body-small-bold">
                <TbNotebook size={12} className="shrink-0" />
                {t('tutorials.onThisPage')}
              </h3>
              <nav className="flex flex-col">
                {toc.map((item, index) => (
                  <Fragment key={item.key}>
                    <button
                      onClick={() => handleClick(item.key)}
                      className="flex items-stretch gap-2 text-left group"
                      type="button"
                    >
                      <div
                        className={cn(
                          'w-px rounded-full shrink-0 group-hover:bg-orange-500',
                          item.key === activeKey
                            ? 'bg-orange-500'
                            : 'bg-brown-100',
                        )}
                      />
                      <span
                        className={cn(
                          'py-0.5 body-small line-clamp-3 group-hover:text-orange-500',
                          item.key === activeKey
                            ? 'text-orange-500'
                            : 'text-brown-800',
                        )}
                      >
                        {item.title}
                      </span>
                    </button>
                    {index < toc.length - 1 && (
                      <div className="h-2 w-px bg-brown-100" />
                    )}
                  </Fragment>
                ))}
              </nav>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
