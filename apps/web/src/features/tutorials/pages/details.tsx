import { useTranslation } from 'react-i18next';
import { tutorialDetailsRoute, tutorialsIndexRoute } from '../routes';
import { computeAssetCdnUrl, trpc } from '../../../utils';
import { useParams } from '@tanstack/react-router';
import { MarkdownBody } from '../../../components/MarkdownBody';
import { TutorialLayout } from '../layout';

export const TutorialDetails = () => {
  const { i18n } = useTranslation();
  const { tutorialId, language } = useParams({
    from: tutorialDetailsRoute.id,
  });

  const { data: tutorial } = trpc.content.getTutorial.useQuery({
    tutorialId: Number(tutorialId),
    language: language ?? i18n.language,
  });

  return (
    <TutorialLayout
      currentCategory={tutorial?.category}
      currentSubcategory={tutorial?.subcategory}
      currentTutorialId={tutorial?.id}
    >
      {tutorial && (
        <div className="flex w-full flex-col items-center justify-center md:px-2">
          <div className="w-full max-w-5xl px-5 md:px-0">
            <h1 className="text-blue-800 w-full border-b-[0.2rem] border-gray-400/50 py-2 text-left text-2xl font-bold uppercase md:text-4xl">
              {tutorial.name}
            </h1>
          </div>
          <div className="text-blue-900 mt-8 w-full space-y-6 px-5 md:max-w-3xl md:px-0">
            <MarkdownBody
              content={tutorial.raw_content}
              assetPrefix={computeAssetCdnUrl(
                tutorial.last_commit,
                tutorial.path
              )}
            />
          </div>
        </div>
      )}
    </TutorialLayout>
  );
};
