import { useTranslation } from 'react-i18next';

import DonateLightning from '../assets/icons/donate_lightning.svg?react';
import TwitterIcon from '../assets/icons/twitter.svg?react';
import WebIcon from '../assets/icons/web.svg?react';
import { useDisclosure } from '../hooks';
import { TRPCRouterOutput } from '../utils/trpc';

import { TipModal } from './tip-modal';
import { TooltipWithContent } from './tooptip-with-content';

interface AuthorCardFullProps extends React.HTMLProps<HTMLDivElement> {
  professor: NonNullable<TRPCRouterOutput['content']['getProfessor']>;
}

export const AuthorCardFull = ({
  professor,
  ...props
}: AuthorCardFullProps) => {
  const { t } = useTranslation();

  const {
    open: openTipModal,
    isOpen: isTipModalOpen,
    close: closeTipModal,
  } = useDisclosure();

  return (
    <div {...props}>
      <div className="border-blue-1000 bg-beige-300 flex flex-col items-start gap-2.5 rounded-2xl border p-2">
        <div className="flex max-w-[44rem] items-start">
          <div className="border-blue-1000 w-fit shrink-0 flex-col items-center justify-center self-stretch rounded-l-[0.9375rem] border bg-blue-800 p-2 sm:flex">
            <img
              src={professor.picture}
              alt="Professor"
              className="mt-4 h-20 w-20 rounded-full sm:h-28 sm:w-28"
            />
            <div className="mt-2 hidden w-full flex-row justify-around sm:flex">
              {professor.links.twitter && (
                <a
                  href={professor.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TwitterIcon className="h-20" />
                </a>
              )}
              {professor.links.website && (
                <a
                  href={professor.links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WebIcon className="h-20" />
                </a>
              )}
            </div>
          </div>
          <div className="border-blue-1000 bg-beige-300 flex flex-col self-stretch rounded-r-2xl border">
            <div className="border-blue-1000 text-beige-300 flex w-full break-all rounded-tr-2xl border-b bg-orange-500 px-4 py-1 text-xl font-semibold sm:w-auto sm:py-2 sm:text-3xl">
              {professor.name}
            </div>
            <div className="relative grow flex-col py-2">
              <div className="flex flex-col justify-between px-5 pb-0 pt-2 md:pt-4">
                <div className="flex flex-wrap content-center items-center gap-2 self-stretch text-sm text-blue-800 sm:gap-5 sm:text-2xl">
                  <p className="text-sm">{professor.bio}</p>
                </div>

                <div className="mt-2 flex flex-wrap content-start items-start gap-2.5 self-stretch text-sm text-blue-700 sm:mt-4 sm:text-lg">
                  {professor.tags?.map((tag) => {
                    return (
                      <div
                        key={tag}
                        className="shadow-md-dark flex items-center rounded-lg bg-gray-100 px-4 py-1 text-xs"
                      >
                        {tag}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="block h-12"></div>
              <div className="absolute bottom-3 right-6 flex flex-row items-end ">
                <div className="hidden text-justify text-[13px] font-light italic text-red-600 sm:block">
                  {t('courses.chapter.thanksTip')}
                </div>
                <div className="ml-4 h-8 w-8 self-start" onClick={openTipModal}>
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
      {isTipModalOpen && (
        <TipModal
          isOpen={isTipModalOpen}
          onClose={closeTipModal}
          lightningAddress={professor.tips.lightningAddress as string}
          userName={professor.name}
        />
      )}
    </div>
  );
};
