import { useTranslation } from 'react-i18next';

import { JoinedProfessor } from '@sovereign-university/types';

import DonateLightning from '../assets/icons/donate_lightning.svg?react';
import NostrIcon from '../assets/icons/nostr.svg?react';
import TwitterIcon from '../assets/icons/twitter.svg?react';
import WebIcon from '../assets/icons/web.svg?react';

import { TooltipWithContent } from './tooptip-with-content';

interface AuthorCardProps extends React.HTMLProps<HTMLDivElement> {
  professor: JoinedProfessor;
}

export const AuthorCard = ({ professor, ...props }: AuthorCardProps) => {
  const { t } = useTranslation();

  return (
    <div {...props}>
      <div className="border-blue-1000 bg-beige-300 flex flex-col items-start gap-2.5 rounded-2xl border p-2">
        <div className="flex max-w-[610px] items-start">
          <div className="border-blue-1000 w-32 shrink-0 flex-col items-center justify-center self-stretch rounded-l-[0.9375rem] border bg-blue-800 p-2 sm:flex">
            <img
              src={professor.picture}
              alt="Professor"
              className="mt-4 h-28 w-28 rounded-full"
            />
            <div className="mt-2 hidden w-full flex-row justify-around sm:flex">
              {professor.nostr && (
                <a
                  href={professor.nostr}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <NostrIcon className="h-20" />
                </a>
              )}
              {professor.twitter_url && (
                <a
                  href={professor.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TwitterIcon className="h-20" />
                </a>
              )}
              {professor.website_url && (
                <a
                  href={professor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WebIcon className="h-20" />
                </a>
              )}
            </div>
          </div>
          <div className="border-blue-1000 bg-beige-300 flex flex-col self-stretch rounded-r-2xl border">
            <div className="border-blue-1000 text-beige-300 flex w-[18.5rem] rounded-tr-2xl border-b bg-orange-500 px-5 py-2 text-3xl font-semibold">
              {professor.name}
            </div>
            <div className="relative grow flex-col py-2">
              <div className="flex flex-col justify-between px-5 py-0">
                <div className="flex flex-wrap content-center items-center gap-2 self-stretch text-sm text-blue-800 sm:gap-5 sm:text-2xl">
                  <div className="flex items-center gap-2 ">
                    <div className="font-semibold">
                      {professor.courses_count}
                    </div>
                    <div className="">{t('words.courses')}</div>
                  </div>
                  <span className="text-lg sm:text-3xl">•</span>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">
                      {professor.tutorials_count}
                    </div>
                    <div className="">{t('words.tutorials')}</div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap content-start items-start gap-2.5 self-stretch text-sm text-blue-700 sm:mt-4 sm:text-lg">
                  {professor.tags.map((tag) => {
                    return (
                      <div className="shadow-md-dark flex items-center rounded-lg bg-gray-100 px-4 py-1">
                        {tag}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="hidden h-12 sm:block"></div>
              <div className="absolute bottom-3 right-6 hidden flex-row items-end sm:flex ">
                <div className="text-justify text-[.8125rem] font-light italic text-red-600">
                  {t('courses.chapter.thanksTip')}
                </div>
                <div className="ml-4 h-8 w-8 self-start">
                  <TooltipWithContent
                    text={t('tutorials.details.tipTooltip')}
                    position="bottom"
                  >
                    <DonateLightning />
                  </TooltipWithContent>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
