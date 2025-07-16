import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { BasicCourse } from '@blms/types';
import { Button } from '@blms/ui';
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
import { RequestSentModal } from '#src/components/request-sent-modal.tsx';
import { ExpandableInfoBanner } from '#src/components/ui/expandable-info-banner.tsx';
import { useTranslatePage } from '#src/hooks/index.ts';
import { filterCoursesByTopic } from '#src/utils/course-filters.ts';

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

  // Success modal state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleRequestSuccess = () => {
    setIsSuccessModalOpen(true);
  };

  // Pagination for courses list
  const PAGE_SIZE = 16;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset visible count when filters change (topic or view mode or loading)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedTopic, viewMode, isLoading]);

  useEffect(() => {
    document.title = `${t('translate.translateCourses')} | Plan ₿ Network`;
  }, [t]);

  /*
   * Helper: merge the global list of courses ready for proofreading with
   * the courses the user already contributed to. This ensures the
   * “Courses to proofread” tab shows EVERY course – regardless of whether
   * the user is currently assigned to it. We keep the deduped union in a
   * memo so we only recompute when inputs change.
   */
  const allCoursesForProofread = useMemo(() => {
    // Build a list of course objects representing the user contributions
    const contributionCourses = (userContributions || [])
      .map((contribution: { courseId: string }) =>
        allCourses?.find((c) => c.id === contribution.courseId),
      )
      .filter((course): course is BasicCourse => course !== undefined);

    // Combine + deduplicate by id
    const combined = [
      ...(filteredCourses as BasicCourse[]),
      ...contributionCourses,
    ];
    const uniqueById = new Map<string, BasicCourse>();
    for (const course of combined) {
      uniqueById.set(course.id, course);
    }
    const union = Array.from(uniqueById.values());

    // Topic filtering happens *after* union so topic dropdown still works
    return filterCoursesByTopic(union, selectedTopic);
  }, [filteredCourses, userContributions, allCourses, selectedTopic]);

  const renderCoursesView = () => {
    if (allCoursesForProofread.length === 0) {
      return (
        <EmptyState
          title={t('translate.noCoursesAvailableForTranslation')}
          description={t('translate.youCanSelectOnlyOneCourse')}
        />
      );
    }

    const displayed = allCoursesForProofread.slice(0, visibleCount);

    return (
      <>
        <CourseGrid
          courses={displayed}
          targetLanguage={targetLanguage}
          userContributions={userContributions}
          refetchUserContributions={refetchUserContributions}
          onRequestSuccess={handleRequestSuccess}
        />
        {visibleCount < allCoursesForProofread.length && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="flagsMobile"
              className="bg-white text-primary border-primary hover:shadow-[0_2px_3px_rgba(0,0,0,0.25)] w-[124px] h-[52px] rounded-[16px] px-[18px] py-[14px] gap-[10px]"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              {t('translate.seeMore', { defaultValue: 'See more' })}
            </Button>
          </div>
        )}
      </>
    );
  };

  const renderContributionsView = () => {
    if (!userContributions || userContributions.length === 0) {
      return <EmptyState title={t('translate.noContributionsYet')} />;
    }

    const contributionCourses = userContributions
      .map((contribution: { courseId: string }) =>
        allCourses?.find((c) => c.id === contribution.courseId),
      )
      .filter((course): course is BasicCourse => course !== undefined);

    // Apply topic filter so the TopicFilter works in "Your contributions" view
    const filteredContributions = filterCoursesByTopic(
      contributionCourses,
      selectedTopic,
    );

    const displayed = filteredContributions.slice(0, visibleCount);

    return (
      <>
        <CourseGrid
          courses={displayed}
          targetLanguage={targetLanguage}
          userContributions={userContributions}
          refetchUserContributions={refetchUserContributions}
          onRequestSuccess={handleRequestSuccess}
        />
        {visibleCount < filteredContributions.length && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="flagsMobile"
              className="bg-white text-primary border-primary hover:shadow-[0_2px_3px_rgba(0,0,0,0.25)] w-[124px] h-[52px] rounded-[16px] px-[18px] py-[14px] gap-[10px]"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              {t('translate.seeMore', { defaultValue: 'See more' })}
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <MainLayout variant="dark" footerVariant="light">
      <div className="flex flex-col items-center bg-white text-black pb-[100px]">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Back Navigation */}
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

          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            {t('translate.selectCourseToTranslate')}
          </h2>

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

          {viewMode === 'courses' ? (
            <ExpandableInfoBanner
              title={t('words.generalInformation', {
                defaultValue: 'General information',
              })}
            >
              <>
                {t('translate.note')}
                <a
                  href="mailto:marjjhodl@proton.me"
                  className="text-orange-500 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('translate.contactUs')}
                </a>
                {' to request support.'}
              </>
            </ExpandableInfoBanner>
          ) : (
            <InfoBanner variant="warning" className="border-0 pl-0">
              {t('translate.noteFewCourses')}
            </InfoBanner>
          )}

          {isLoading ? (
            <LoadingSpinner />
          ) : viewMode === 'courses' ? (
            renderCoursesView()
          ) : (
            renderContributionsView()
          )}

          {/* Success modal */}
          <RequestSentModal
            isOpen={isSuccessModalOpen}
            onClose={() => setIsSuccessModalOpen(false)}
          />
        </div>
      </div>
    </MainLayout>
  );
}
