import { Button, Loader, TableBody, TableCell, TableRow } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { trpcClient } from '#src/utils/trpc.js';
import { TranslationPanelHeader } from '../-components/translation-panel-header.tsx';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../../../-components/shared-table-header.tsx';

import ArrowIcon from '#src/assets/icons/arrow_filled.svg';

const courseDetailsSearchSchema = z.object({
  language: z.string().optional(),
});

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/translation-panel/course/$courseId',
)({
  validateSearch: courseDetailsSearchSchema,
  component: CourseDetailsPage,
});

interface CourseLanguage {
  code: string;
  name: string;
  translationStatus: string;
  assigneeId?: string;
  assigneeUsername?: string;
  assigneeDisplayName?: string;
}

interface CourseInfo {
  courseId: string;
  courseIndex: string;
  courseName: string;
  languages: CourseLanguage[];
}

interface CourseDetails {
  id: string;
  courseIndex: string;
  courseName: string;
  translationStatus: string;
  assigneeDisplayName?: string;
  progress: number;
  totalChapters: number;
  completedChapters: number;
  parts: Array<{
    partId: string;
    partIndex: number;
    partTitle: string;
    chapters: Array<{
      chapterId: string;
      chapterIndex: number;
      chapterTitle: string;
      status: string;
      updatedAt?: string;
    }>;
  }>;
}

function CourseDetailsPage() {
  const { courseId } = Route.useParams();
  const { language = 'fr' } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        setCourseInfoLoading(true);
        const data = await trpcClient.content.getCourseLanguages.query({
          courseId,
        });
        setCourseInfo(data);
        setCourseInfoError(null);
      } catch (error) {
        console.error('Error fetching course languages:', error);
        setCourseInfoError(error);
      } finally {
        setCourseInfoLoading(false);
      }
    };

    fetchCourseInfo();
  }, [courseId]);

  // Fetch course details for selected language
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setCourseDetailsLoading(true);
        const data = await trpcClient.content.getCourseDetails.query({
          courseId,
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

    fetchCourseDetails();
  }, [courseId, selectedLanguage]);

  const handleBackToContentManagement = () => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel',
      search: { tab: 'content' },
    });
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    navigate({
      to: '/$lang/dashboard/administration/translation-panel/course/$courseId',
      params: { courseId },
      search: { language: languageCode },
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready_for_review':
        return 'bg-purple-100 text-purple-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return t('dashboard.adminPanel.translationPanel.status.published');
      case 'reviewed':
        return t('dashboard.adminPanel.translationPanel.status.reviewed');
      case 'under_review':
        return t('dashboard.adminPanel.translationPanel.status.underReview');
      case 'ready_for_review':
        return t('dashboard.adminPanel.translationPanel.status.readyForReview');
      case 'in_progress':
        return t('dashboard.adminPanel.translationPanel.status.inProgress');
      case 'todo':
        return t('dashboard.adminPanel.translationPanel.status.todo');
      default:
        return t('dashboard.adminPanel.translationPanel.status.todo');
    }
  };

  const isLanguageClickable = (status: string) => {
    return [
      'ready_for_review',
      'under_review',
      'reviewed',
      'published',
    ].includes(status);
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
      <div className="flex flex-col gap-6 lg:gap-8">
        <TranslationPanelHeader activeTab="content" showTabs={false}>
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={handleBackToContentManagement}
                className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
              >
                <img
                  src={ArrowIcon}
                  alt="Back"
                  className="w-3 h-3 rotate-180"
                />
                {t(
                  'dashboard.adminPanel.translationPanel.contentManagement.actions.backToContentManagement',
                )}
              </button>
            </div>
            <div className="text-center py-8 text-red-500">
              {t('dashboard.adminPanel.translationPanel.courseNotFound')}
            </div>
          </div>
        </TranslationPanelHeader>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <TranslationPanelHeader activeTab="content" showTabs={false}>
        <div className="mt-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <button
              type="button"
              onClick={handleBackToContentManagement}
              className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
            >
              <img src={ArrowIcon} alt="Back" className="w-3 h-3 rotate-180" />
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.actions.backToContentManagement',
              )}
            </button>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{courseInfo.courseIndex}</span>
          </div>

          {/* Course Title with Index */}
          <div className="flex items-center gap-4 mb-6">
            <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-md">
              {courseInfo.courseIndex}
            </span>
            <h1 className="title-large-sb-24px text-dashboardSectionTitle">
              {courseInfo.courseName || courseInfo.courseId}
            </h1>
          </div>

          {/* Current contributor and Language filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <span className="text-sm font-medium text-gray-700 mr-3">
                {t(
                  'dashboard.adminPanel.translationPanel.courseDetails.currentContributor',
                )}
              </span>
              <span className="text-sm text-gray-600">
                {courseDetails?.assigneeDisplayName ||
                  t(
                    'dashboard.adminPanel.translationPanel.courseDetails.noContributor',
                  )}
              </span>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700 mr-3">
                {t(
                  'dashboard.adminPanel.translationPanel.courseDetails.language',
                )}
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {courseInfo.languages.map((lang) => {
                  const isClickable = isLanguageClickable(
                    lang.translationStatus,
                  );
                  const isSelected = lang.code === selectedLanguage;

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() =>
                        isClickable && handleLanguageChange(lang.code)
                      }
                      disabled={!isClickable}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        isSelected && isClickable
                          ? 'bg-newOrange-1 text-white border-newOrange-1'
                          : isClickable
                            ? 'bg-white text-newOrange-1 border-newOrange-1 hover:bg-newOrange-1 hover:text-white'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {lang.name || lang.code.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {courseDetails && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {t(
                    'dashboard.adminPanel.translationPanel.courseDetails.progress',
                  )}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {courseDetails.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${courseDetails.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {courseDetails.completedChapters} /{' '}
                {courseDetails.totalChapters}{' '}
                {t(
                  'dashboard.adminPanel.translationPanel.courseDetails.chaptersCompleted',
                )}
              </span>
            </div>
          )}

          {/* Chapters Table */}
          {courseDetailsLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader size="lg" />
            </div>
          ) : courseDetailsError || !courseDetails ? (
            <div className="text-center py-8 text-gray-500">
              {t(
                'dashboard.adminPanel.translationPanel.courseDetails.errorLoadingDetails',
              )}
            </div>
          ) : (
            <div className="bg-white">
              <h2 className="title-large-sb-24px text-dashboardSectionTitle mb-4 p-6 pb-0">
                {t(
                  'dashboard.adminPanel.translationPanel.courseDetails.chaptersAndProgress',
                )}
              </h2>

              {!courseDetails.parts || courseDetails.parts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t(
                    'dashboard.adminPanel.translationPanel.courseDetails.noChapters',
                  )}
                </div>
              ) : (
                <div className="space-y-6 p-6">
                  {courseDetails.parts.map((part) => (
                    <div key={part.partId} className="border rounded-lg">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h3 className="font-medium text-gray-900">
                          {t(
                            'dashboard.adminPanel.translationPanel.courseDetails.partTitle',
                            {
                              index: part.partIndex,
                              title: part.partTitle || `Part ${part.partIndex}`,
                            },
                          )}
                        </h3>
                      </div>

                      <div className="p-4">
                        <SharedTable>
                          <SharedTableHeader>
                            <SharedTableHead className="w-24">
                              {t(
                                'dashboard.adminPanel.translationPanel.courseDetails.chapterIndex',
                              )}
                            </SharedTableHead>
                            <SharedTableHead>
                              {t(
                                'dashboard.adminPanel.translationPanel.courseDetails.chapterTitle',
                              )}
                            </SharedTableHead>
                            <SharedTableHead className="w-32">
                              {t(
                                'dashboard.adminPanel.translationPanel.courseDetails.status',
                              )}
                            </SharedTableHead>
                            <SharedTableHead className="w-24">
                              {t(
                                'dashboard.adminPanel.translationPanel.courseDetails.progress',
                              )}
                            </SharedTableHead>
                            <SharedTableHead className="w-32">
                              {t(
                                'dashboard.adminPanel.translationPanel.courseDetails.actions',
                              )}
                            </SharedTableHead>
                          </SharedTableHeader>
                          <TableBody>
                            {part.chapters.map((chapter) => (
                              <TableRow
                                key={chapter.chapterId}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <TableCell className="py-4 font-medium text-gray-900">
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                                    {chapter.chapterIndex}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="text-sm font-medium text-gray-900 break-words">
                                    {chapter.chapterTitle ||
                                      `Chapter ${chapter.chapterIndex}`}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getStatusBadgeClass(
                                      chapter.status,
                                    )}`}
                                  >
                                    {getStatusText(chapter.status)}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 text-sm text-gray-700">
                                  {chapter.status === 'reviewed' ||
                                  chapter.status === 'published'
                                    ? '100%'
                                    : chapter.status === 'in_progress'
                                      ? '50%'
                                      : '0%'}
                                </TableCell>
                                <TableCell className="py-4 text-center">
                                  <Button
                                    size="s"
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                    onClick={() => {
                                      console.log(
                                        'View details for chapter:',
                                        chapter.chapterId,
                                      );
                                    }}
                                  >
                                    {t(
                                      'dashboard.adminPanel.translationPanel.userManagement.actions.viewDetails',
                                    )}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </SharedTable>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </TranslationPanelHeader>
    </div>
  );
}
