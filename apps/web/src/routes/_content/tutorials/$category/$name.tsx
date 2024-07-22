import { Link, createFileRoute, useParams } from '@tanstack/react-router';
import { capitalize } from 'lodash-es';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import DonateLightning from '#src/assets/icons/donate_lightning.svg?react';
import Spinner from '#src/assets/spinner_orange.svg?react';
import { AuthorCard } from '#src/components/author-card.js';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { TipModal } from '#src/components/tip-modal.js';
import { TooltipWithContent } from '#src/components/tooptip-with-content.js';
import { TutorialsMarkdownBody } from '#src/components/TutorialsMarkdownBody/index.js';
import { useDisclosure } from '#src/hooks/use-disclosure.js';
import { AppContext } from '#src/providers/context.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';
import { SITE_NAME } from '#src/utils/meta.js';
import { formatNameForURL } from '#src/utils/string.js';
import { type TRPCRouterOutput, trpc } from '#src/utils/trpc.js';

import { TutorialLayout } from '../-other/layout.tsx';

export const Route = createFileRoute('/_content/tutorials/$category/$name')({
  component: TutorialDetails,
});

function TutorialDetails() {
  const { t, i18n } = useTranslation();
  const { category, name } = useParams({
    from: '/tutorials/$category/$name',
  });

  const {
    open: openTipModal,
    isOpen: isTipModalOpen,
    close: closeTipModal,
  } = useDisclosure();

  const { data: tutorial, isFetched } = trpc.content.getTutorial.useQuery({
    category,
    name,
    language: i18n.language,
  });

  const { tutorials } = useContext(AppContext);
  const isFetchedTutorials = tutorials && tutorials.length > 0;

  const likeTutorialMutation = trpc.user.tutorials.likeTutorial.useMutation({
    onSuccess: () => console.log('Success'),
  });

  function headerAndFooterText() {
    return (
      <div className="text-xs text-red-500 sm:text-base">
        {isFetched && tutorial && (
          <button
            onClick={() =>
              likeTutorialMutation.mutate({ id: tutorial.id, liked: true })
            }
          >
            Test like
          </button>
        )}
        {isFetched && tutorial && (
          <button
            onClick={() =>
              likeTutorialMutation.mutate({ id: tutorial.id, liked: false })
            }
          >
            Test dislike
          </button>
        )}
      </div>
    );
  }

  function header(
    tutorial: NonNullable<TRPCRouterOutput['content']['getTutorial']>,
  ) {
    return (
      <div className="px-5 md:px-0">
        <h1 className="border-b-2 border-newBlack-3 py-2.5 text-left text-2xl font-bold uppercase text-newBlack-1 md:text-5xl leading-[116%] stroke-[#D9D9D9] stroke-1">
          {tutorial.title}
        </h1>
        <div className="mt-4 flex flex-row justify-between">
          {headerAndFooterText()}
          {(tutorial.credits?.name || tutorial.credits?.link) && (
            <button onClick={openTipModal}>
              <TooltipWithContent
                text={t('tutorials.details.tipTooltip')}
                position="bottom"
              >
                <DonateLightning />
              </TooltipWithContent>
            </button>
          )}
        </div>

        <section className="flex flex-col">
          {tutorial.credits?.link && (
            <span className="body-16px text-black">
              {t('tutorials.details.source')}
              <a
                href={tutorial.credits.link}
                target="_blank"
                rel="noreferrer"
                className="leading-snug tracking-015px underline text-newBlue-1"
              >
                {tutorial.credits.link}
              </a>
            </span>
          )}
          {tutorial.credits?.professor?.name && (
            <span className="body-16px text-black">
              {t('tutorials.details.author')}
              <a
                href={`/professor/${formatNameForURL(tutorial.credits.professor.name)}-${tutorial.credits.professor.id}`}
                className="title-small-med-16px hover:underline"
              >
                {tutorial.credits.professor.name}
              </a>
            </span>
          )}
        </section>
      </div>
    );
  }

  return (
    <TutorialLayout
      currentCategory={tutorial?.category}
      currentSubcategory={tutorial?.subcategory}
      currentTutorialId={tutorial?.id}
    >
      <>
        {tutorial && (
          <>
            <PageMeta
              title={`${SITE_NAME} - ${tutorial?.title}`}
              description={capitalize(
                tutorial?.description || tutorial?.rawContent,
              )}
            />
            <div className="-mt-4 w-full max-w-5xl lg:hidden">
              <span className="mb-2 w-full text-left text-lg font-normal leading-6 text-orange-500">
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
              <div className="w-full space-y-6 overflow-hidden text-blue-900 md:max-w-3xl">
                {header(tutorial)}
                {isFetchedTutorials && (
                  <TutorialsMarkdownBody
                    content={tutorial.rawContent}
                    assetPrefix={computeAssetCdnUrl(
                      tutorial.lastCommit,
                      tutorial.path,
                    )}
                    tutorials={tutorials || []}
                  />
                )}
                <div>{headerAndFooterText()}</div>
              </div>
              {tutorial.credits?.professor?.id && (
                <div className="mt-4 flex w-full flex-col items-center space-y-2 p-5 text-blue-900 sm:px-0">
                  <h2 className="text-2xl font-semibold">
                    {t('tutorials.details.enjoyed')}
                  </h2>
                  <p className="text-xl">
                    {t('tutorials.details.checkAuthor')}
                  </p>
                  {tutorial.credits?.professor && (
                    <Link
                      to={`/professor/${formatNameForURL(tutorial.credits.professor.name)}-${tutorial.credits.professor.id}`}
                      key={tutorial.credits.professor.id}
                    >
                      <AuthorCard
                        className="py-4"
                        professor={tutorial.credits.professor}
                      ></AuthorCard>
                    </Link>
                  )}
                </div>
              )}
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

        {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
      </>
    </TutorialLayout>
  );
}
