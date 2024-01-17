import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import DonateLightning from '../../../assets/icons/donate_lightning.svg?react';
import { AuthorCard } from '../../../components/author-card';
import { TipModal } from '../../../components/tip-modal';
import { TooltipWithContent } from '../../../components/tooptip-with-content';
import { TutorialsMarkdownBody } from '../../../components/TutorialsMarkdownBody';
import { useDisclosure } from '../../../hooks';
import { computeAssetCdnUrl, trpc } from '../../../utils';
import { TRPCRouterOutput } from '../../../utils/trpc';
import { TutorialLayout } from '../layout';

export const TutorialDetails = () => {
  const { t, i18n } = useTranslation();
  const { category, name } = useParams({
    from: '/tutorials/$category/$name',
  });

  const {
    open: openTipModal,
    isOpen: isTipModalOpen,
    close: closeTipModal,
  } = useDisclosure();

  const { data: tutorial } = trpc.content.getTutorial.useQuery({
    category,
    name,
    language: i18n.language,
  });

  function headerAndFooterText(creditName: string, creditUrl: string) {
    return (
      <div className="text-xs text-red-500 sm:text-base">
        {creditName && (
          <div>
            <span className="font-light">{t('tutorials.details.madeBy')}</span>
            <span className="font-semibold"> {creditName}</span>
          </div>
        )}
        {creditUrl && (
          <div>
            <span className="font-light uppercase">
              {t('tutorials.details.source')}
            </span>
            <a href={creditUrl} target="_blank" rel="noopener noreferrer">
              <span className="font-semibold"> {creditUrl}</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  function header(
    tutorial: NonNullable<TRPCRouterOutput['content']['getTutorial']>,
  ) {
    return (
      <div className="px-5 sm:px-0">
        <h1 className="border-b-[0.2rem] border-gray-400/50 py-2 text-left text-2xl font-bold uppercase text-blue-800 sm:text-4xl">
          {tutorial.title}
        </h1>
        <div className="mt-4 flex flex-row justify-between">
          {headerAndFooterText(
            tutorial.credits?.name as string,
            tutorial.credits?.link as string,
          )}
          {(tutorial.credits?.name || tutorial.credits?.link) && (
            <div onClick={openTipModal}>
              <TooltipWithContent
                text={t('tutorials.details.tipTooltip')}
                position="bottom"
              >
                <DonateLightning />
              </TooltipWithContent>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <TutorialLayout
      currentCategory={tutorial?.category}
      currentSubcategory={tutorial?.subcategory}
      currentTutorialId={tutorial?.id}
    >
      {tutorial && (
        <>
          <div className="mt-[-1rem] w-full max-w-5xl lg:hidden">
            <span className=" mb-2 w-full text-left text-lg font-normal leading-6 text-orange-500">
              <Link to="/tutorials">{t('words.tutorials') + ` > `}</Link>
              <Link
                to={'/tutorials/$category'}
                params={{ category: tutorial.category }}
                className="capitalize"
              >
                {tutorial.category + ` > `}
              </Link>
              <span className="capitalize">{tutorial.title}</span>
            </span>
          </div>
          <div className="flex w-full flex-col items-center justify-center px-2">
            <div className="mt-4 w-full space-y-6 overflow-hidden text-blue-900 md:max-w-3xl">
              {header(tutorial)}
              <TutorialsMarkdownBody
                content={tutorial.raw_content}
                assetPrefix={computeAssetCdnUrl(
                  tutorial.last_commit,
                  tutorial.path,
                )}
              />
              <div>
                {headerAndFooterText(
                  tutorial.credits?.name as string,
                  tutorial.credits?.link as string,
                )}
              </div>
            </div>
            <div className="mt-4 flex w-full flex-col items-center space-y-2 bg-gray-200 p-5 text-blue-900 sm:px-0">
              <h2 className="text-2xl font-semibold">
                {t('tutorials.details.enjoyed')}
              </h2>
              <p className="text-xl">{t('tutorials.details.checkAuthor')}</p>
              {tutorial.credits?.professor && (
                <Link
                  to={'/professor/$professorId'}
                  params={{
                    professorId: tutorial.credits.professor.id.toString(),
                  }}
                  key={tutorial.credits.professor.id}
                >
                  <AuthorCard
                    className="py-4"
                    professor={tutorial.credits.professor}
                  ></AuthorCard>
                </Link>
              )}
            </div>
          </div>
          {isTipModalOpen && (
            <TipModal
              isOpen={isTipModalOpen}
              onClose={closeTipModal}
              lightningAddress={
                tutorial.credits?.professor?.tips.lightningAddress as string
              }
              userName={tutorial.credits?.professor?.name as string}
            />
          )}
        </>
      )}
    </TutorialLayout>
  );
};
