import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { BasicCourse } from '@blms/types';
import BreadcrumbArrowIcon from '#src/assets/icons/breadcrumb_navigation_arrow_orange.svg';
import {
  CourseGrid,
  EmptyState,
  InfoBanner,
  LoadingSpinner,
  MainLayout,
  ToggleSwitch,
  TopicFilter,
} from '#src/components/index.ts';
import { useTranslatePage } from '#src/hooks/index.ts';

export const Route = createFileRoute('/$lang/content/translate/')({
  component: TranslateCoursesPage,
});

export default Route;

function TranslateCoursesPage() {
  const { t } = useTranslation();
  const {
    // State
    viewMode,
    selectedTopic,
    targetLanguage,

    // Data
    userContributions,
    uniqueTopics,
    filteredCourses,
    isLoading,
    allCourses,

    // Actions
    handleTopicSelect,
    toggleViewMode,
    refetchUserContributions,

    // Utils
    i18n,
  } = useTranslatePage();

  useEffect(() => {
    document.title = `${t('translate.translateCourses')} | Plan ₿ Network`;
  }, [t]);

  const renderCoursesView = () => {
    if (filteredCourses.length > 0) {
      return (
        <CourseGrid
          courses={filteredCourses}
          targetLanguage={targetLanguage}
          userContributions={userContributions}
          refetchUserContributions={refetchUserContributions}
        />
      );
    }

    return (
      <EmptyState
        title={t('translate.noCoursesAvailableForTranslation')}
        description={t('translate.youCanSelectOnlyOneCourse')}
      />
    );
  };

  const renderContributionsView = () => {
    if (userContributions && userContributions.length > 0) {
      const contributionCourses = userContributions
        .map((contribution: { courseId: string }) =>
          allCourses?.find((c) => c.id === contribution.courseId),
        )
        .filter((course): course is BasicCourse => course !== undefined);

      return (
        <CourseGrid
          courses={contributionCourses}
          targetLanguage={targetLanguage}
          userContributions={userContributions}
          refetchUserContributions={refetchUserContributions}
        />
      );
    }

    return <EmptyState title={t('translate.noContributionsYet')} />;
  };

  return (
    <MainLayout variant="dark" footerVariant="light">
      <div className="flex flex-col items-center bg-white text-black">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-1 text-base mb-6">
            <img
              src={BreadcrumbArrowIcon}
              alt=""
              className="w-[8px] h-[12px]"
            />
            <Link
              to="/$lang/content/"
              params={{ lang: i18n.language }}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              {t('translate.backToSectionToTranslate', {
                defaultValue: 'Back to section to translate',
              })}
            </Link>
            <img
              src={BreadcrumbArrowIcon}
              alt=""
              className="w-[8px] h-[12px]"
            />
            <span className="text-orange-500 font-medium">
              {t('translate.courses', { defaultValue: 'Courses' })}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-6 text-gray-900">
            {t('translate.selectCourseToTranslate')}
          </h1>

          <div className="mb-8">
            <ToggleSwitch
              checked={viewMode === 'contributions'}
              onChange={() =>
                toggleViewMode(
                  viewMode === 'courses' ? 'contributions' : 'courses',
                )
              }
              leftLabel={t('translate.coursesToTranslate')}
              rightLabel={t('translate.yourContributions')}
            />
          </div>

          <TopicFilter
            topics={uniqueTopics}
            selectedTopic={selectedTopic}
            onTopicSelect={handleTopicSelect}
            title={t('words.topics')}
          />

          <InfoBanner variant="warning">
            {t('translate.noteFewCourses')}
          </InfoBanner>

          {isLoading ? (
            <LoadingSpinner />
          ) : viewMode === 'courses' ? (
            renderCoursesView()
          ) : (
            renderContributionsView()
          )}
        </div>
      </div>
    </MainLayout>
  );
}
