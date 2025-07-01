import { getStatusText } from '@blms/shared';
import type { CourseDetails, CourseInfo } from '@blms/types';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Loader } from '../../bases/loader.js';
import { ChaptersTable } from './chapters-table.js';
import { CourseHeader } from './course-header.js';
import { CourseProgressBar } from './course-progress-bar.js';
import { LanguageSelector } from './language-selector.js';

interface CourseDetailsQueries {
  getCourseLanguages: (params: { id: string }) => Promise<CourseInfo>;
  getCourseDetails: (params: {
    id: string;
    language: string;
  }) => Promise<CourseDetails>;
}

interface CourseDetailsOptions {
  courseId: string;
  language?: string;
}

interface CourseDetailsPageProps {
  options: CourseDetailsOptions;
  queries: CourseDetailsQueries;
  onLanguageChange?: (courseId: string, language: string) => void;
  onChapterAction?: (chapterId: string) => void;
  breadcrumbItems?: Array<{
    label: string;
    onClick?: () => void;
  }>;
  // Labels for localization
  labels: {
    currentContributor: string;
    noContributor: string;
    language: string;
    progress: string;
    chaptersCompleted: string;
    chaptersAndProgress: string;
    noChapters: string;
    partTitle: (index: number, title: string) => string;
    chapterIndex: string;
    chapterTitle: string;
    status: string;
    actions: string;
    actionButtonText: string;
    courseNotFound: string;
    errorLoadingDetails: string;
  };
  // Translation function for status texts
  t: (key: string) => string;
  className?: string;
}

export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = ({
  options,
  queries,
  onLanguageChange,
  onChapterAction,
  breadcrumbItems = [],
  labels,
  t,
  className = '',
}) => {
  const { courseId, language = 'fr' } = options;

  // State for course languages
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [courseInfoLoading, setCourseInfoLoading] = useState(true);
  const [courseInfoError, setCourseInfoError] = useState<any>(null);

  // State for course details (for selected language)
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
    null,
  );
  const [courseDetailsLoading, setCourseDetailsLoading] = useState(true);
  const [courseDetailsError, setCourseDetailsError] = useState<any>(null);

  // Selected language state
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  // Fetch course languages
  const fetchCourseInfo = async () => {
    try {
      setCourseInfoLoading(true);
      const data = await queries.getCourseLanguages({ id: courseId });
      setCourseInfo(data);
      setCourseInfoError(null);
    } catch (error) {
      console.error('Error fetching course languages:', error);
      setCourseInfoError(error);
    } finally {
      setCourseInfoLoading(false);
    }
  };

  // Fetch course details for selected language
  const fetchCourseDetails = async () => {
    try {
      setCourseDetailsLoading(true);
      const data = await queries.getCourseDetails({
        id: courseId,
        language: selectedLanguage,
      });
      setCourseDetails(data);
      setCourseDetailsError(null);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setCourseDetailsError(error);
    } finally {
      setCourseDetailsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchCourseInfo();
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId, selectedLanguage]);

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    onLanguageChange?.(options.courseId, languageCode);
  };

  if (courseInfoLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader size="xl" />
      </div>
    );
  }

  if (courseInfoError || !courseInfo) {
    return (
      <div className={`flex flex-col gap-6 lg:gap-8 ${className}`}>
        <div className="text-center py-8 text-red-500">
          {labels.courseNotFound}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 lg:gap-8 ${className}`}>
      <CourseHeader
        courseIndex={courseInfo.index}
        courseName={courseInfo.name || courseInfo.id}
        assigneeDisplayName={courseDetails?.assigneeDisplayName || undefined}
        breadcrumbItems={breadcrumbItems}
        labels={{
          currentContributor: labels.currentContributor,
          noContributor: labels.noContributor,
        }}
      >
        <LanguageSelector
          languages={courseInfo.languages.map((l) => ({
            translationStatus: 'todo',
            assigneeId: null,
            assigneeUsername: null,
            assigneeDisplayName: null,
            ...l,
          }))}
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
          languageLabel={labels.language}
        />
      </CourseHeader>

      {/* Progress Bar */}
      {courseDetails && (
        <CourseProgressBar
          progress={courseDetails.progress}
          completedChapters={courseDetails.completedChapters}
          totalChapters={courseDetails.totalChapters}
          progressLabel={labels.progress}
          chaptersCompletedLabel={labels.chaptersCompleted}
          className="mb-6"
        />
      )}

      {/* Chapters Table */}
      {courseDetailsLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader size="xl" />
        </div>
      ) : courseDetailsError || !courseDetails ? (
        <div className="text-center py-8 text-gray-500">
          {labels.errorLoadingDetails}
        </div>
      ) : (
        <div className="bg-white">
          <h2 className="title-large-sb-24px text-dashboardSectionTitle mb-4 p-6 pb-0">
            {labels.chaptersAndProgress}
          </h2>

          <div className="p-6">
            <ChaptersTable
              parts={courseDetails.parts}
              onChapterAction={onChapterAction}
              actionButtonText={labels.actionButtonText}
              getStatusText={(status) => getStatusText(status, t)}
              labels={{
                partTitle: labels.partTitle,
                chapterIndex: labels.chapterIndex,
                chapterTitle: labels.chapterTitle,
                status: labels.status,
                progress: labels.progress,
                actions: labels.actions,
                noChapters: labels.noChapters,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
