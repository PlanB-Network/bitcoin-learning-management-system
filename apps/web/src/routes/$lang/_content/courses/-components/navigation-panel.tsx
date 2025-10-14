import type { CourseResponse, JoinedCourseChapter } from '@blms/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from '@blms/ui';
import { Link } from '@tanstack/react-router';
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

const isCurrentChapter = (
  chapter: JoinedCourseChapter,
  currentChapter: Chapter,
) => {
  return chapter.chapterId === currentChapter.chapterId;
};

const isPastPart = (chapter: JoinedCourseChapter, currentChapter: Chapter) => {
  return chapter.partIndex <= currentChapter.partIndex;
};

const isPastChapter = (
  chapter: JoinedCourseChapter,
  currentChapter: Chapter,
) => {
  return (
    chapter.partIndex < currentChapter.partIndex ||
    (chapter.partIndex === currentChapter.partIndex &&
      chapter.chapterIndex < currentChapter.chapterIndex)
  );
};

export const NavigationPanel: React.FC<Props> = ({
  course,
  chapters,
  currentChapter,
}: Props) => {
  return (
    <aside className="bg-white z-10 w-full max-w-[240px] max-h-[80lvh] rounded-2xl border border-neutral-100 p-4 overflow-y-auto scrollbar-light">
      <ul className="flex flex-col gap-2">
        {chapters
          .filter((chapter) => chapter.chapterIndex === 1)
          .map((chapterOne) => (
            <Collapsible
              key={`${chapterOne.partIndex}${chapterOne.chapterIndex}`}
              defaultOpen={chapterOne.partIndex === currentChapter.partIndex}
            >
              <div key={`${chapterOne.partIndex}${chapterOne.chapterIndex}`}>
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
                    .filter(
                      (chapter) => chapter.partIndex === chapterOne.partIndex,
                    )
                    .map((chapter, index) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: explanation
                      <li key={index + 1000}>
                        <Link
                          to={'/courses/$courseId/$chapterId'}
                          params={{
                            chapterId: chapter.chapterId,
                            courseId: course.id,
                          }}
                        >
                          <div className="ml-2 flex items-center gap-1">
                            <TbPointFilled
                              size={16}
                              className={cn(
                                'shrink-0',
                                isPastChapter(chapter, currentChapter)
                                  ? 'text-black'
                                  : isCurrentChapter(chapter, currentChapter)
                                    ? 'text-orange-500'
                                    : 'text-neutral-400',
                              )}
                            />
                            <span
                              className={cn(
                                'body-extra-small hover:text-orange-500',
                                isPastChapter(chapter, currentChapter)
                                  ? 'text-black'
                                  : isCurrentChapter(chapter, currentChapter)
                                    ? 'text-orange-500'
                                    : 'text-neutral-400',
                              )}
                            >
                              {chapter.title}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
      </ul>
    </aside>
  );
};
