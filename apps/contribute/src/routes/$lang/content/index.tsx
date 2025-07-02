import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CircuitPattern } from '#src/components/circuit-pattern.tsx';
import {
  Breadcrumb,
  InfoBanner,
  MainLayout,
  SectionCard,
} from '#src/components/index.ts';
import { trpcClient } from '#src/utils/trpc.ts';

export const Route = createFileRoute('/$lang/content/')({
  component: ContentSectionPage,
});

function ContentSectionPage() {
  const { t, i18n } = useTranslation();
  const { lang } = Route.useParams();
  const [courseTranslationProgress, setCourseTranslationProgress] =
    useState<number>(0);
  const [, setIsLoadingProgress] = useState(false);

  // Get the target language from localStorage (selected on previous page)
  const [targetLanguage, setTargetLanguage] = useState<string>('en');

  useEffect(() => {
    const savedTargetLanguage = localStorage.getItem('targetLanguage') || 'en';
    setTargetLanguage(savedTargetLanguage);
  }, []);

  // Fetch translation progress using trpcClient
  useEffect(() => {
    const fetchTranslationProgress = async () => {
      if (!targetLanguage) return;

      try {
        setIsLoadingProgress(true);
        const progressData =
          await trpcClient.content.getTranslationProgress.query({
            language: targetLanguage,
          });

        if (progressData?.progress !== undefined) {
          setCourseTranslationProgress(Math.round(progressData.progress));
        }
      } catch (error) {
        console.error('Failed to fetch translation progress:', error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    fetchTranslationProgress();
  }, [targetLanguage]);

  useEffect(() => {
    document.title = `${t('translate.selectSection')} | Plan ₿ Network`;
  }, [t]);

  return (
    <MainLayout variant="dark" footerVariant="light">
      <div className="flex flex-col items-center bg-white text-black">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb to="/$lang" params={{ lang: i18n.language }}>
            {t('translate.backToLanguages')}
          </Breadcrumb>

          <h1 className="text-2xl font-bold mb-6 text-gray-900">
            {t('translate.selectSection')}
          </h1>

          <InfoBanner variant="warning">
            {t('translate.sectionSelectionInfo')}
          </InfoBanner>

          {/* Section Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            <SectionCard
              title="Cours"
              progress={courseTranslationProgress}
              linkTo="/$lang/content/translate"
              linkParams={{ lang }}
              buttonText={t('translate.selectSectionToTranslate')}
            />

            <SectionCard title="Tutoriels" progress={73} isComingSoon={true} />

            <SectionCard title="WebLate" progress={89} isComingSoon={true} />
          </div>
        </div>

        {/* Circuit background decoration */}
        <div className="w-full bg-gray-50 py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="opacity-70">
              <CircuitPattern />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
