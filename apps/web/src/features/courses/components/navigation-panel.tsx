import { Link } from '@tanstack/react-router';
import { CSSProperties } from 'react';
import { BsFillTriangleFill } from 'react-icons/bs';

import { cn } from '@sovereign-university/ui';

interface Chapter {
  id: string;
  title: string;
}

interface Props {
  chapters: Chapter[];
  currentChapterIndex: number;
  courseId: string;
  courseTitle: string;
  style?: CSSProperties;
}

export const NavigationPanel: React.FC<Props> = ({
  chapters,
  currentChapterIndex,
  courseId,
  courseTitle,
  style,
}) => {
  return (
    <div
      className="mt-2  h-auto w-48 rounded-b-3xl border-r bg-gray-200 p-4 shadow-xl "
      style={style}
    >
      <h2 className=" mb-2 border-b-2 border-b-orange-500 py-1 text-base font-semibold uppercase text-orange-500">
        {courseTitle}
      </h2>
      <div>
        <ul className="flex flex-col gap-2">
          {chapters.map((chapter, index) => (
            <li
              key={chapter.id}
              className={cn(
                'text-xs font-semibold',
                index < currentChapterIndex - 1
                  ? 'text-orange-500'
                  : 'text-gray-500',
                index === currentChapterIndex - 1 ? 'text-orange-700' : '',
              )}
            >
              <Link
                to={'/courses/$courseId/$chapterIndex'}
                params={{
                  courseId: courseId,
                  chapterIndex: String(index + 1),
                }}
              >
                <div className="grid grid-cols-8 items-center gap-1">
                  <div className="col-span-1">
                    <BsFillTriangleFill size={10} className="mr-2 rotate-90" />
                  </div>
                  <div className="col-span-7">
                    <span>{chapter.title}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
