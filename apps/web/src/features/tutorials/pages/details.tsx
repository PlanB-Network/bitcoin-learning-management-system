/// <reference types="vite-plugin-svgr/client" />

import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { MarkdownBody } from '../../../components/MarkdownBody';
import { TipIcon } from '../../../components/tip-icon';
import { computeAssetCdnUrl, trpc } from '../../../utils';
import { AuthorCard } from '../components/author-card';
import { TutorialLayout } from '../layout';

export const TutorialDetails = () => {
  const { i18n } = useTranslation();
  const { tutorialId, language } = useParams({
    from: '/tutorials/$category/$tutorialId/$language',
  });

  const { data: tutorial } = trpc.content.getTutorial.useQuery({
    tutorialId: Number(tutorialId),
    language: language ?? i18n.language,
  });

  const { t } = useTranslation();

  function headerAndFooterText() {
    return (
      <div className="text-red-500">
        <div>
          <span>{t('tutorials.details.madeBy')}</span>
          <span className="font-semibold"> Rogzy</span>
        </div>
        <div>
          <span className="uppercase">{t('tutorials.details.source')}</span>
          <span className="font-semibold">
            https://grunch.dev/blog/rgbnode-tutorial/
          </span>
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
        <div className="flex flex-col items-center justify-center md:px-2">
          <div className="mt-4 space-y-6 px-5 text-blue-900 md:max-w-3xl md:px-0">
            <div className="max-w-5xl px-5 md:px-0">
              <h1 className="border-b-[0.2rem] border-gray-400/50 py-2 text-left text-2xl font-bold uppercase text-blue-800 md:text-4xl">
                {tutorial.name}
              </h1>
              <div className="mt-4 flex flex-row justify-between">
                {headerAndFooterText()}

                <div>
                  <TipIcon />
                </div>
              </div>
            </div>
            <MarkdownBody
              content={tutorial.raw_content}
              assetPrefix={computeAssetCdnUrl(
                tutorial.last_commit,
                tutorial.path,
              )}
            />
            <div>{headerAndFooterText()}</div>
          </div>
          <div className="mt-4 flex w-screen flex-col items-center space-y-2 bg-gray-200 p-5 text-blue-900 md:px-0">
            <h2 className="text-2xl font-semibold">
              {t('tutorials.details.enjoyed')}
            </h2>
            <p className="text-xl">{t('tutorials.details.checkAuthor')}</p>
            <AuthorCard className="py-4" name="ARMAN THE PARMAND"></AuthorCard>
          </div>
        </div>
      )}
    </TutorialLayout>
  );
};
