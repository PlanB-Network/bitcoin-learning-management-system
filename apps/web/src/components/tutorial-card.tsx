import { Link } from '@tanstack/react-router';
import { useState } from 'react';

import type { JoinedTutorialLight } from '@blms/types';

import { assetUrl } from '../utils/index.ts';

interface TutorialCardProps extends React.HTMLProps<HTMLDivElement> {
  tutorial: JoinedTutorialLight;
}

export const TutorialCard = ({ tutorial, ...props }: TutorialCardProps) => {
  const [logoSrc, setLogoSrc] = useState(assetUrl(tutorial.path, 'logo.webp'));

  const fallbackSrc = assetUrl(tutorial.builder?.path ?? '', 'logo.webp');

  return (
    <div {...props}>
      <Link
        to={`/tutorials/${tutorial.category}/${tutorial.subcategory}/${tutorial.name}-${tutorial.id}`}
        key={tutorial.id}
      >
        {/* Big screen */}
        <div className="bg-beige-300 hidden flex-row justify-start space-x-4 rounded-2xl border border-blue-800 px-4 py-3 md:flex">
          <img
            className="m-1 size-20 self-center rounded-full"
            src={logoSrc}
            alt={tutorial.name}
            onError={() => setLogoSrc(fallbackSrc)}
          />
          <div className="flex w-full flex-col self-start">
            <h2 className="text-xl font-semibold uppercase text-orange-500">
              {tutorial.title}
            </h2>
            <p className="max-w-md text-xs font-light capitalize text-blue-900">
              {tutorial.description}
            </p>
            <div className="flex flex-row items-center justify-start space-x-2 pt-3">
              {tutorial.tags.map((tag) => (
                <div
                  key={tag}
                  className="rounded-lg bg-gray-100 px-1.5 py-1 text-xs text-blue-800 shadow-md"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Small screen */}
        <div className="bg-beige-300 flex flex-row justify-start space-x-4 rounded-2xl border border-blue-800 px-4 py-3 md:hidden">
          <div className="flex flex-col">
            <div className="flex flex-row self-start">
              <img
                className="mr-4 size-12 self-center rounded-full"
                src={logoSrc}
                alt={tutorial.name}
                onError={() => setLogoSrc(fallbackSrc)}
              />
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold uppercase text-orange-500">
                  {tutorial.title}
                </h2>
                <p className="max-w-md text-xs font-light capitalize text-blue-900">
                  {tutorial.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2 pt-3">
              {tutorial.tags.map((tag) => (
                <div
                  key={tag}
                  className="rounded-lg bg-gray-100 px-1.5 py-1 text-xs text-blue-800 shadow-md"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
