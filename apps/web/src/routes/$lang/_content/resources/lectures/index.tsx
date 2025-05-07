import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader, Switch } from '@blms/ui';

import { LANGUAGES_MAP } from '@blms/shared';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import Flag from '#src/molecules/Flag/index.tsx';
import { trpc } from '#src/utils/trpc.js';

import { LectureCard } from '../-components/cards/lecture-card.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute('/$lang/_content/resources/lectures/')({
  component: Lectures,
});

function Lectures() {
  const { t, i18n } = useTranslation();
  const isMobile = useSmaller('md');
  const [showLocalOnly, setShowLocalOnly] = useState(true);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const { data: lectures, isFetched } = trpc.content.getLectures.useQuery(
    {},
    { staleTime: 300_000 },
  );

  const localLectures =
    lectures?.filter((lecture) => lecture.languages.includes(i18n.language)) ??
    [];

  const englishLectures =
    lectures?.filter((lecture) => lecture.languages.includes('en')) ?? [];

  const handleLanguageSwitchChange = (checked: boolean) => {
    setShowLocalOnly(checked);
  };

  const handleFreeSwitchChange = (checked: boolean) => {
    setShowFreeOnly(checked);
  };

  const selectedLectures = showLocalOnly ? localLectures : (lectures ?? []);

  const filteredLectures = showFreeOnly
    ? selectedLectures.filter((lecture) => lecture.priceDollars === 0)
    : selectedLectures;

  const isEnglishLanguage = i18n.language === 'en';

  return (
    <ResourceLayout title={t('lectures.pageTitle')} activeCategory="lectures">
      <div className="flex flex-col gap-4 md:gap-9 mt-4 md:mt-12 mx-auto">
        <div className="flex items-center justify-between pb-2 md:pb-2.5 border-b border-b-newGray-1">
          {/* Switch for Language Filtering */}
          <div className="flex items-center gap-1 md:gap-2.5">
            <span className="label-small-12px md:label-large-med-20px text-white">
              {t('resources.toggleLabelAll')}
            </span>
            <Switch
              onCheckedChange={handleLanguageSwitchChange}
              defaultChecked
            />
            <span className="label-small-12px md:label-large-med-20px text-white">
              {t('resources.toggleLabelSelectedLanguage')}
            </span>
          </div>
          {/* Switch for Free-Only Filtering */}
          <div className="flex items-center gap-1 md:gap-2.5">
            <span className="label-small-12px md:label-large-med-20px text-white">
              {t('resources.toggleLabelAll')}
            </span>
            <Switch onCheckedChange={handleFreeSwitchChange} />
            <span className="label-small-12px md:label-large-med-20px text-white">
              {t('resources.toggleFreeOnly')}
            </span>
          </div>
        </div>

        {showLocalOnly && (
          <div className="flex items-center gap-3">
            <Flag
              code={i18n.language}
              size={isMobile ? 'm' : 'l'}
              className="shrink-0 !rounded-none mb-0.5 md:mb-0"
            />
            <span className="text-white subtitle-medium-caps-18px md:subtitle-large-caps-22px">
              {LANGUAGES_MAP[i18n.language] || 'Language'}
            </span>
          </div>
        )}

        {/* Render Filtered Lectures */}
        <div className="flex flex-wrap gap-[15px] md:gap-[45px] justify-center">
          {!isFetched && <Loader size="s" />}
          {filteredLectures?.length ? (
            filteredLectures.map((lecture) => (
              <LectureCard key={lecture.id} lecture={lecture} />
            ))
          ) : (
            <p className="text-center text-gray-500">
              {t('resources.lectures.noLectures')}
            </p>
          )}
        </div>

        {showLocalOnly && !isEnglishLanguage && englishLectures.length > 0 && (
          <section>
            <div className="flex items-center gap-3 pt-6 border-t border-t-newGray-1 mb-4 md:mb-9">
              <Flag
                code="en"
                size={isMobile ? 'm' : 'l'}
                className="shrink-0 !rounded-none mb-0.5 md:mb-0"
              />
              <span className="text-white subtitle-medium-caps-18px md:subtitle-large-caps-22px">
                {LANGUAGES_MAP.en}
              </span>
            </div>
            <div className="flex flex-wrap gap-[15px] md:gap-[45px] justify-center">
              {englishLectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} />
              ))}
            </div>
          </section>
        )}
      </div>
    </ResourceLayout>
  );
}
