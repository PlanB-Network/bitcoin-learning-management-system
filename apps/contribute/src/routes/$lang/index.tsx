import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CircuitPattern } from '#src/components/circuit-pattern.tsx';
import { MainLayout } from '#src/components/layouts/main-layout.tsx';
import Flag from '#src/molecules/Flag/index.tsx';

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
      <div className="flex flex-col items-center bg-white text-black">
        {/* Hero section */}
        <section className="w-full py-12 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-orange-500 font-medium mb-4">
              {t('translate.makingBitcoinEducationGlobal')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('translate.bitcoinTranslationCommunity')}
            </h1>
            <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('translate.bridgingLanguageGaps')}
            </p>
          </div>
        </section>

        {/* Language selection section */}
        <section className="w-full py-8 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              {t('translate.selectCourseToTranslate')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('translate.youCanSelectOnlyOneCourse')}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {languages.map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="flex flex-col items-center p-4 border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    <Flag code={lang.code} size="l" />
                  </div>
                  <span className="text-center font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Request language section */}
        <section className="w-full py-12 px-4">
          <div className="max-w-3xl mx-auto bg-gray-50 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-orange-500 mb-4">
              {t('translate.languageMissing')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('translate.helpExpandBitcoinEducation')}
            </p>
            <div className="text-right">
              <a
                href="mailto:contact@planb.network"
                className="inline-flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {t('translate.contactUs')}{' '}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

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
