import { Link } from '@tanstack/react-router';
import { CSSProperties } from 'react';
import { BsFillCircleFill, BsFillTriangleFill } from 'react-icons/bs';

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
}

interface Props {
  course: TRPCRouterOutput['content']['getCourse'];
  chapters: ChapterFromArray[];
  currentChapter: Chapter;
  style?: CSSProperties;
}

export const NavigationPanel: React.FC<Props> = ({
  course,
  chapters,
  currentChapter,
  style,
}) => {
  return (
    <div
      className="mt-2  h-auto w-48 rounded-b-3xl border-r bg-gray-200 p-4 shadow-xl "
      style={style}
    >
      <Link to={'/courses/$courseId'} params={{ courseId: course.id }}>
        <h2 className=" mb-2 border-b-2 border-b-orange-500 py-1 text-base font-semibold uppercase text-orange-500">
          {addSpaceToCourseId(course.id)}
        </h2>
      </Link>
      <div>
        <ul className="flex flex-col gap-2">
          {chapters.map((chapter, index) => (
            <>
              {chapter.chapter === 1 && (
                <div className="grid grid-cols-8 items-center gap-1">
                  <BsFillCircleFill size={10} />
                  <span>{chapter.part}</span>
                </div>
              )}
              <li
                key={index + 1000}
                className={cn(
                  'text-xs font-semibold',
                  chapter.part < currentChapter.part.part ||
                    (chapter.part === currentChapter.part.part &&
                      chapter.chapter < currentChapter.chapter)
                    ? 'text-orange-500'
                    : 'text-gray-500',
                  chapter.part === currentChapter.part.part &&
                    chapter.chapter === currentChapter.chapter
                    ? 'text-orange-500'
                    : '',
                )}
              >
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
                      <BsFillTriangleFill
                        size={10}
                        className="mr-2 rotate-90"
                      />
                    </div>
                    <div className="col-span-7">
                      <span>{chapter.title}</span>
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
