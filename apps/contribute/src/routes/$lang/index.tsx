import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpcClient } from '#src/utils/trpc.ts';

import { MainLayout } from '#src/components/layouts/main-layout.tsx';
// Removed Flag import because flags are no longer displayed

export const Route = createFileRoute('/$lang/')({
  component: ContributePage,
});

function ContributePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // State to hold allowed languages for the current reviewer (null while loading)
  const [allowedLanguages, setAllowedLanguages] = useState<string[] | null>(
    null,
  );

  // Fetch reviewer languages on mount
  useEffect(() => {
    (async () => {
      try {
        const resp: string[] = await ((
          trpcClient as any
        ).user.translation.getReviewerLanguages?.query?.() || []);
        setAllowedLanguages(resp.map((l: string) => l.toLowerCase()));
      } catch (error) {
        console.error('Failed to fetch reviewer languages', error);
        // If unauthorized or error, treat as no allowed languages
        setAllowedLanguages([]);
      }
    })();
  }, []);

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

  // Sort languages so that allowed ones appear first (after allowedLanguages is loaded)
  const sortedLanguages = [...languages].sort((a, b) => {
    if (allowedLanguages === null) return 0; // loading, keep original order
    const aAllowed = allowedLanguages.includes(a.code.toLowerCase());
    const bAllowed = allowedLanguages.includes(b.code.toLowerCase());
    if (aAllowed === bAllowed) return 0;
    return aAllowed ? -1 : 1;
  });

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
              {t('translate.selectYourLanguage', {
                defaultValue: 'Select your language',
              })}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('translate.youCanSelectOnlyOneLanguage', {
                defaultValue:
                  'You can only choose one language at a time to begin proofreading the related content',
              })}
            </p>

            <div className="grid grid-cols-[repeat(auto-fit,_minmax(135px,_1fr))] gap-x-[20px] gap-y-[20px] justify-items-center">
              {sortedLanguages.map((lang) => {
                const isAllowed =
                  allowedLanguages?.includes(lang.code.toLowerCase()) ?? false;

                return (
                  <button
                    type="button"
                    key={lang.code}
                    onClick={
                      isAllowed
                        ? () => handleLanguageSelect(lang.code)
                        : undefined
                    }
                    disabled={!isAllowed}
                    className={`flex items-center justify-center px-2 w-[135px] h-[135px] border rounded-lg transition-colors ${
                      isAllowed
                        ? 'border-orange-200 bg-orange-50 text-orange-500 cursor-pointer hover:bg-[#FFEEE5] hover:text-[#4D4D4D] hover:shadow-[0_1px_1px_rgba(0,0,0,0.25)] transition-shadow'
                        : 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    <span className="font-medium text-center text-sm md:text-base">
                      {lang.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        {/* Divider */}
        <div className="w-full px-4">
          <hr className="w-full max-w-4xl mx-auto border-t border-[#808080] my-12" />
        </div>
        {/* Request language section */}
        <section className="w-full px-10 md:px-10 lg:px-40 xl:px-60">
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
