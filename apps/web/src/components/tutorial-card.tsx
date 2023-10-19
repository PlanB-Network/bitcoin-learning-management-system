import { Link } from '@tanstack/react-router';

import { computeAssetCdnUrl } from '../utils';
import { TRPCRouterOutput } from '../utils/trpc';

interface TutorialCardProps extends React.HTMLProps<HTMLDivElement> {
  tutorial: NonNullable<TRPCRouterOutput['content']['getTutorials']>[number];
}

export const TutorialCard = ({ tutorial, ...props }: TutorialCardProps) => {
  return (
    <div {...props}>
      <Link
        to={'/tutorials/$category/$name'}
        params={{
          category: tutorial.category,
          name: tutorial.name,
        }}
        key={tutorial.id}
      >
        {/* Big screen */}
        <div className="bg-beige-300 hidden flex-row justify-start space-x-4 rounded-2xl border border-blue-800 px-4 py-3 md:flex">
          <img
            className="m-1 h-20 w-20 self-center rounded-full"
            src={
              tutorial.builder
                ? computeAssetCdnUrl(
                    tutorial.builder.last_commit,
                    `${tutorial.builder.path}/assets/logo.jpeg`,
                  )
                : computeAssetCdnUrl(
                    tutorial.last_commit,
                    `${tutorial.path}/assets/logo.jpeg`,
                  )
            }
            alt=""
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
                <div className="rounded-lg bg-gray-100 px-1.5 py-1 text-xs text-blue-800 shadow-md">
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
                className="mr-4 h-12 w-12 self-center rounded-full"
                src={
                  tutorial.builder
                    ? computeAssetCdnUrl(
                        tutorial.builder.last_commit,
                        `${tutorial.builder.path}/assets/logo.jpeg`,
                      )
                    : computeAssetCdnUrl(
                        tutorial.last_commit,
                        `${tutorial.path}/assets/logo.jpeg`,
                      )
                }
                alt=""
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
                <div className="rounded-lg bg-gray-100 px-1.5 py-1 text-xs text-blue-800 shadow-md">
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
