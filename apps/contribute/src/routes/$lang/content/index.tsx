import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BreadcrumbArrowIcon from '#src/assets/icons/breadcrumb_navigation_arrow_orange.svg';
import { MainLayout, SectionCard } from '#src/components/index.ts';
import { trpcClient } from '#src/utils/trpc.ts';

export const Route = createFileRoute('/$lang/content/')({
  component: ContentSectionPage,
});

function ContentSectionPage() {
  const { t, i18n } = useTranslation();
  const { lang } = Route.useParams();
  const [courseTranslationProgress, setCourseTranslationProgress] =
    useState<number>(0);

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
        const progressData =
          await trpcClient.content.getTranslationProgress.query({
            language: targetLanguage,
          });

        if (progressData?.progress !== undefined) {
          setCourseTranslationProgress(Math.round(progressData.progress));
        }
      } catch (error) {
        console.error('Failed to fetch translation progress:', error);
      }
    };

    fetchTranslationProgress();
  }, [targetLanguage]);

  useEffect(() => {
    document.title = `${t('translate.selectSection')} | Plan ₿ Network`;
  }, [t]);

  return (
    <MainLayout variant="dark" footerVariant="light">
      <div className="flex flex-col items-center bg-white text-black pb-[100px]">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Main Content Header */}
          <div className="text-center mb-10 mt-10">
            <p className="text-orange-500 text-base font-medium mb-2">
              {t('translate.bridgingLanguageGaps', {
                defaultValue: 'Bridging language gaps, one video at a time',
              })}
            </p>
            <h1
              className="mb-4 text-gray-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              style={{
                fontFamily: 'Rubik, sans-serif',
                fontWeight: 400,
                lineHeight: '117%',
              }}
            >
              {t('translate.bitcoinTranslationCommunity', {
                defaultValue: 'Bitcoin Proofreading Community',
              })}
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              {t('translate.joinOurProofreaders', {
                defaultValue:
                  'Join our proofreading team to make Bitcoin education accessible worldwide. You can help more people engage with the ecosystem and find their path to freedom!',
              })}
            </p>
          </div>

          {/* Back Navigation */}
          <div className="flex items-center gap-1 text-base mb-6">
            <img
              src={BreadcrumbArrowIcon}
              alt=""
              className="w-[8px] h-[12px]"
            />
            <Link
              to="/$lang"
              params={{ lang: i18n.language }}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              {t('translate.backToLanguages')}
            </Link>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            {t('translate.selectSection')}
          </h2>

          <div className="mb-8">
            <p
              className="text-black font-normal text-base leading-6 tracking-[0.15px]"
              style={{ fontFamily: 'Rubik, sans-serif' }}
            >
              {t('translate.sectionSelectionInfo')}
            </p>
          </div>

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
      </div>
    </MainLayout>
  );
}
