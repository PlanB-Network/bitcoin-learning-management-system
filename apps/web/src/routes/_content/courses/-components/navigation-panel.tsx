/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Link } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { BsFillCircleFill, BsFillTriangleFill } from 'react-icons/bs';

import type { JoinedCourseChapter, JoinedCourseWithAll } from '@blms/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from '@blms/ui';

import { addSpaceToCourseId } from '#src/utils/courses.js';

interface Chapter {
  title: string;
  partIndex: number;
  chapterIndex: number;
  chapterId: string;
}

interface Props {
  course: JoinedCourseWithAll;
  chapters: JoinedCourseChapter[];
  currentChapter: Chapter;
  style?: CSSProperties;
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
  style,
}: Props) => {
  return (
    <div
      className="bg-white z-10 w-full max-w-[270px] max-h-[80lvh] rounded-b-2xl border border-darkOrange-0 pt-4 pb-7 px-2.5 shadow-course-navigation overflow-y-scroll scrollbar-light"
      style={style}
    >
      <Link
        to={'/courses/$courseId'}
        params={{ courseId: course.id }}
        className="w-fit cursor-default"
      >
        <h2 className="desktop-h4 uppercase text-darkOrange-5 text-center hover:font-medium w-fit mx-auto hover:cursor-pointer">
          {addSpaceToCourseId(course.id)}
        </h2>
      </Link>
      <hr className="mb-4 mt-1 border-darkOrange-5" />
      <div className="ml-2">
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
                        'flex items-baseline gap-2.5 text-sm font-semibold mb-1  hover:text-darkOrange-5',
                        isPastPart(chapterOne, currentChapter)
                          ? 'text-black'
                          : 'text-newGray-1',
                      )}
                    >
                      <BsFillTriangleFill
                        size={10}
                        className="group-data-[state=open]:rotate-180 group-data-[state=closed]:rotate-90 shrink-0 transition-transform ease-in-out"
                      />
                      <span className="capitalize font-poppins">
                        {chapterOne.partTitle.toLowerCase()}
                      </span>
                    </li>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {chapters
                      .filter(
                        (chapter) => chapter.partIndex === chapterOne.partIndex,
                      )
                      .map((chapter, index) => (
                        <li key={index + 1000}>
                          <Link
                            to={'/courses/$courseId/$chapterId'}
                            params={{
                              courseId: course.id,
                              chapterId: chapter.chapterId,
                            }}
                          >
                            <div className="mt-1 grid grid-cols-8 items-center gap-1">
                              <div className="col-span-1">
                                <BsFillCircleFill
                                  size={10}
                                  className={cn(
                                    'text-xs ml-2',
                                    isPastChapter(chapter, currentChapter)
                                      ? 'text-black'
                                      : isCurrentChapter(
                                            chapter,
                                            currentChapter,
                                          )
                                        ? 'text-darkOrange-5'
                                        : 'text-newGray-3',
                                  )}
                                />
                              </div>
                              <div className="col-span-7">
                                <span
                                  className={cn(
                                    'text-xs font-poppins hover:text-darkOrange-5',
                                    isPastChapter(chapter, currentChapter)
                                      ? 'text-black'
                                      : isCurrentChapter(
                                            chapter,
                                            currentChapter,
                                          )
                                        ? 'text-darkOrange-5'
                                        : 'text-newGray-3',
                                  )}
                                >
                                  {chapter.title}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
        </ul>
      </div>
    </div>
  );
};
