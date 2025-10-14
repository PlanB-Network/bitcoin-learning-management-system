import type { CourseResponse, JoinedCourseChapter } from '@blms/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { TbPointFilled, TbTriangleInvertedFilled } from 'react-icons/tb';

interface Chapter {
  title: string;
  partIndex: number;
  chapterIndex: number;
  chapterId: string;
}

interface Props {
  course: CourseResponse;
  chapters: JoinedCourseChapter[];
  currentChapter: Chapter;
}

const isCurrentChapter = (chapter: JoinedCourseChapter, current: Chapter) =>
  chapter.chapterId === current.chapterId;

const isPastPart = (chapter: JoinedCourseChapter, current: Chapter) =>
  chapter.partIndex <= current.partIndex;

const isPastChapter = (chapter: JoinedCourseChapter, current: Chapter) =>
  chapter.partIndex < current.partIndex ||
  (chapter.partIndex === current.partIndex &&
    chapter.chapterIndex < current.chapterIndex);

export const NavigationPanel: React.FC<Props> = ({
  course,
  chapters,
  currentChapter,
}: Props) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFixed(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-96px 0px 0px 0px' },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-0" />

      <aside
        className={cn(
          'bg-white z-10 w-full max-w-[240px] max-h-[80lvh] rounded-2xl border border-neutral-100 p-4 overflow-y-auto scrollbar-light transition-all duration-300',
          isFixed ? 'fixed top-24' : 'relative',
        )}
      >
        <ul className="flex flex-col gap-2">
          {chapters
            .filter((ch) => ch.chapterIndex === 1)
            .map((chapterOne) => (
              <Collapsible
                key={`${chapterOne.partIndex}${chapterOne.chapterIndex}`}
                defaultOpen={chapterOne.partIndex === currentChapter.partIndex}
              >
                <CollapsibleTrigger className="group flex justify-start text-left">
                  <li
                    className={cn(
                      'flex items-center gap-2',
                      isPastPart(chapterOne, currentChapter)
                        ? 'text-black'
                        : 'text-neutral-600',
                    )}
                  >
                    <TbTriangleInvertedFilled
                      size={10}
                      className="group-data-[state=open]:rotate-0 group-data-[state=closed]:-rotate-90 shrink-0 transition-transform ease-in-out"
                    />
                    <span className="body-extra-small-bold">
                      {chapterOne.partTitle}
                    </span>
                  </li>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-3 mt-2">
                  {chapters
                    .filter((ch) => ch.partIndex === chapterOne.partIndex)
                    .map((ch, index) => (
                      <li
                        key={`${ch.chapterId}-${index}`}
                        className="list-none"
                      >
                        <Link
                          to={'/courses/$courseId/$chapterId'}
                          params={{
                            courseId: course.id,
                            chapterId: ch.chapterId,
                          }}
                        >
                          <div className="ml-2 flex items-center gap-1">
                            <TbPointFilled
                              size={16}
                              className={cn(
                                'shrink-0',
                                isPastChapter(ch, currentChapter)
                                  ? 'text-black'
                                  : isCurrentChapter(ch, currentChapter)
                                    ? 'text-orange-500'
                                    : 'text-neutral-400',
                              )}
                            />
                            <span
                              className={cn(
                                'body-extra-small hover:text-orange-500',
                                isPastChapter(ch, currentChapter)
                                  ? 'text-black'
                                  : isCurrentChapter(ch, currentChapter)
                                    ? 'text-orange-500'
                                    : 'text-neutral-400',
                              )}
                            >
                              {ch.title}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
        </ul>
      </aside>
    </>
  );
};
