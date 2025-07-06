import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { MainLayout } from '#src/components/layouts/main-layout.tsx';
// Removed Flag import because flags are no longer displayed

export const Route = createFileRoute('/$lang/')({
  component: ContributePage,
});

function ContributePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // For improved SEO
  useEffect(() => {
    document.title = `Plan ₿ Network - ${t('translate.makingBitcoinEducationGlobal')}`;
  }, [t]);

  // Define language options with their flags and names
  // Ensuring we use codes that match the SVG files in public/flags
  const languages = [
    { code: 'CS', name: 'Čeština' },
    { code: 'DE', name: 'Deutsch' },
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Español' },
    { code: 'IT', name: 'Italiano' },
    { code: 'ET', name: 'Eesti Keel' },
    { code: 'FI', name: 'Suomi' },
    { code: 'FR', name: 'Français' },
    { code: 'ID', name: 'Bahasa Indonesia' },
    { code: 'JA', name: '日本語' },
    { code: 'NB-NO', name: 'Norsk Bokmål' },
    { code: 'PT', name: 'Português' },
    { code: 'RU', name: 'Русский' },
    { code: 'VI', name: 'Tieng Viet' },
    { code: 'ZH-HANS', name: '中文简体' },
  ];

  const handleLanguageSelect = (langCode: string) => {
    // Save selected language for later use
    localStorage.setItem('targetLanguage', langCode.toLowerCase());
    // Navigate to content section selection page
    navigate({
      to: '/$lang/content',
      params: { lang: i18n.language },
    });
  };

  return (
    <MainLayout variant="dark" footerVariant="light">
      <div className="flex flex-col items-center bg-white text-black pb-[100px]">
        {/* Hero section */}
        <section className="w-full py-12 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-orange-500 text-base font-medium mb-2">
              {t('translate.bridgingLanguageGaps', {
                defaultValue: 'Bridging language gaps, one video at a time',
              })}
            </div>
            <h1
              className="mb-4 text-gray-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              style={{
                fontFamily: 'Rubik, sans-serif',
                fontWeight: 400,
                lineHeight: '117%',
              }}
            >
              {t('translate.bitcoinTranslationCommunity')}
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              {t('translate.joinOurProofreaders', {
                defaultValue:
                  'Join our proofreading team to make Bitcoin education accessible worldwide. You can help more people engage with the ecosystem and find their path to freedom!',
              })}
            </p>
          </div>
        </section>

        {/* Language selection section */}
        <section className="w-full py-0 px-4 md:px-10 lg:px-20 xl:px-40 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {t('translate.selectCourseToTranslate')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('translate.youCanSelectOnlyOneCourse')}
            </p>

            <div className="grid grid-cols-[repeat(auto-fit,_minmax(135px,_1fr))] gap-x-[20px] gap-y-[20px] justify-items-center">
              {languages.map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="flex items-center justify-center px-2 w-[135px] h-[135px] border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-500 hover:text-black transition-colors cursor-pointer"
                >
                  <span className="font-medium text-center text-sm md:text-base">
                    {lang.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
        {/* Divider */}
        <div className="w-full px-4">
          <hr className="w-full max-w-4xl mx-auto border-t border-[#808080] my-12" />
        </div>
        {/* Request language section */}
        <section className="w-full px-4 md:px-10 lg:px-20 xl:px-40">
          <div className="w-full min-h-[189px] bg-gray-50 border border-[#E5E5E5] rounded-[20px] p-5 flex flex-col md:flex-row">
            <div className="flex flex-col gap-4">
              <h2 className="text-orange-500 text-3xl md:text-[40px] leading-[1.24] tracking-[0.25px] font-normal text-left">
                {t('translate.languageMissing')}
              </h2>
              <p className="text-gray-600 text-base md:text-[20px] leading-[1.33] font-normal text-left">
                {t('translate.helpExpandBitcoinEducation')}
              </p>
            </div>
            <div className="ml-auto flex items-end mt-4 md:mt-0">
              <a
                href="mailto:contact@planb.network"
                className="inline-flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap shrink-0"
              >
                {t('translate.contactUs')}{' '}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
