import { Disclosure } from '@headlessui/react';
import { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { BsFillCircleFill, BsFillTriangleFill } from 'react-icons/bs';

import { trpc } from '@sovereign-academy/api-client';

interface Chapter {
  id: string;
  title: string;
}

interface Props {
  chapters: Chapter[];
  courseTitle: string; // Add courseTitle prop
  style?: CSSProperties;
}
export const VerticalTable: React.FC<Props> = ({
  chapters,
  courseTitle,
  style,
}) => {
  return (
    <div
      className="mt-2  h-auto w-48 rounded-b-3xl border-r bg-gray-200 
      p-4 shadow-xl "
      style={style}
    >
      <h2 className=" mb-2 border-b-2 border-b-orange-600 py-1 text-base font-semibold uppercase text-orange-800">
        {courseTitle}
      </h2>
      <ul>
        {chapters.map((chapter) => (
          <li key={chapter.id} className="text-xxs mb-2">
            {chapter.id}
            <ul>
              <li className="flex items-center font-semibold text-orange-800">
                {' '}
                {/* Use a flex container */}
                <BsFillTriangleFill
                  size={10}
                  className="mr-2 rotate-90 " // Adjust the icon placement
                />
                {chapter.title}
              </li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};
