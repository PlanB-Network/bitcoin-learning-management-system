import { Link } from '@tanstack/react-router';
import { CSSProperties } from 'react';
import { BsFillCircleFill, BsFillTriangleFill } from 'react-icons/bs';
import { IoIosArrowDropdownCircle } from 'react-icons/io';

import { addSpaceToCourseId, cn } from '@sovereign-university/ui';

import { TRPCRouterOutput } from '../../../utils/trpc';

interface Part {
  part: number;
}
interface Chapter {
  title: string;
  chapter: number;
  part: Part;
}

interface ChapterFromArray {
  title: string;
  chapter: number;
  part: number;
  part_title: string;
}

interface Props {
  course: TRPCRouterOutput['content']['getCourse'];
  chapters: ChapterFromArray[];
  currentChapter: Chapter;
  style?: CSSProperties;
}

function isChapterPast(chapter: ChapterFromArray, currentChapter: Chapter) {
  return (
    chapter.part < currentChapter.part.part ||
    (chapter.part === currentChapter.part.part &&
      chapter.chapter <= currentChapter.chapter)
  );
}

export const NavigationPanel: React.FC<Props> = ({
  course,
  chapters,
  currentChapter,
  style,
}) => {
  return (
    <div
      className="z-50 mt-2 h-auto w-60 rounded-b-3xl border-r bg-gray-200 p-4 shadow-xl "
      style={style}
    >
      <Link to={'/courses/$courseId'} params={{ courseId: course.id }}>
        <div className="-ml-2 grid grid-cols-8">
          <IoIosArrowDropdownCircle
            size={40}
            className="col-span-2 text-orange-500"
          />
          <h2 className=" col-span-6 py-1 text-3xl font-semibold uppercase text-orange-500">
            {addSpaceToCourseId(course.id)}
          </h2>
        </div>
      </Link>
      <hr className="mb-2 border-orange-400" />
      <div>
        <ul className="flex flex-col gap-2">
          {chapters.map((chapter, index) => (
            <>
              {chapter.chapter === 1 && (
                <li
                  className={cn(
                    'grid grid-cols-8 items-center gap-1 text-sm font-semibold mt-1',
                    isChapterPast(chapter, currentChapter)
                      ? 'text-orange-500'
                      : 'text-gray-500',
                  )}
                >
                  <BsFillTriangleFill
                    size={10}
                    className="col-span-1 mr-2 rotate-90"
                  />
                  <span className="col-span-7">{chapter.part_title}</span>
                </li>
              )}
              <li key={index + 1000}>
                <Link
                  to={'/courses/$courseId/$partIndex/$chapterIndex'}
                  params={{
                    courseId: course.id,
                    partIndex: chapter.part.toString(),
                    chapterIndex: chapter.chapter.toString(),
                  }}
                >
                  <div className="grid grid-cols-8 items-center gap-1">
                    <div className="col-span-1">
                      <BsFillCircleFill
                        size={10}
                        className={cn(
                          'text-xs',
                          isChapterPast(chapter, currentChapter)
                            ? 'text-orange-400'
                            : 'text-gray-300',
                        )}
                      />
                    </div>
                    <div className="col-span-7">
                      <span
                        className={cn(
                          'text-xs',
                          isChapterPast(chapter, currentChapter)
                            ? 'text-orange-500'
                            : 'text-gray-500',
                        )}
                      >
                        {chapter.title}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            </>
          ))}
        </ul>
      </div>
    </div>
  );
};
