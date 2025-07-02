import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowRightLong } from 'react-icons/fa6';
import { HiOutlineViewGrid } from 'react-icons/hi';

import type { BasicCourse } from '@blms/types';

import { Image } from '#src/components/image.tsx';
import Flag from '#src/molecules/Flag/index.tsx';
import { getLanguageName } from '#src/utils/i18n.ts';
import { assetUrl } from '#src/utils/index.ts';
import { trpcClient } from '#src/utils/trpc.ts';

// Import the correct logo assets
import PlanBLogoBlack from '../../../../../assets/logo/planb_logo_horizontal_black_orangepill_gradient.svg';

/**
 * Represents a course translation with essential properties
 */
export interface CourseTranslation {
  id: string;
  courseId: string;
  language: string;
}

/**
 * Props for the CourseTranslationCard component
 */
export interface CourseTranslationCardProps {
  course: BasicCourse;
  targetLanguage?: string;
  userContributions?: Array<{ courseId: string; assignmentStatus?: string }>;
  refetchUserContributions?: () => Promise<void>;
}

interface TranslationAssignment {
  status: string;
}

/**
 * A card component for displaying course translation information
 */
export const CourseTranslationCard = ({
  course,
  targetLanguage: propTargetLanguage,
  userContributions,
  refetchUserContributions,
}: CourseTranslationCardProps): JSX.Element => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasEnglishTranslation, setHasEnglishTranslation] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  // Get target language from localStorage or prop
  const [targetLanguage] = useState<string>(() => {
    return propTargetLanguage || localStorage.getItem('targetLanguage') || 'en';
  });

  // Find user's contribution for this course
  const userContribution = userContributions?.find(
    (contribution) => contribution.courseId === course.id,
  );

  // State for existing assignment check
  const [existingAssignment, setExistingAssignment] =
    useState<TranslationAssignment | null>(null);
  const [, setIsCheckingAssignment] = useState(false);

  // Check if user has existing translation assignment
  useEffect(() => {
    const checkExistingAssignment = async () => {
      // Only check if not already in contributions
      if (!course.id || !targetLanguage || userContribution) return;

      try {
        setIsCheckingAssignment(true);
        const data =
          await trpcClient.user.translation.checkUserTranslationAssignment.query(
            {
              courseId: course.id,
              language: targetLanguage,
            },
          );
        if (data) {
          setExistingAssignment({ status: String(data.status ?? '') });
        } else {
          setExistingAssignment(null);
        }
      } catch (error) {
        console.error('Failed to check existing assignment:', error);
        setExistingAssignment(null);
      } finally {
        setIsCheckingAssignment(false);
      }
    };

    checkExistingAssignment();
  }, [course.id, targetLanguage, userContribution]);

  // Determine the assignment status
  const assignmentStatus =
    userContribution?.assignmentStatus || existingAssignment?.status;
  const hasAssignment = !!userContribution || !!existingAssignment;

  // For now, assume English translation exists if original language is not English
  // This logic can be enhanced later if needed
  useEffect(() => {
    if (course.originalLanguage !== 'en') {
      setHasEnglishTranslation(true);
    }
  }, [course.originalLanguage]);

  // Handle course selection
  const handleCourseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Don't open modal if user has a pending request
    if (assignmentStatus === 'requested') {
      return;
    }
    // If assigned, navigate to proofreading interface (for now just prevent modal)
    if (assignmentStatus === 'assigned') {
      // TODO: Navigate to proofreading interface
      console.log('Navigate to proofreading interface for course:', course.id);
      return;
    }
    setIsModalOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Don't open modal if user has a pending request
      if (assignmentStatus === 'requested') {
        return;
      }
      // If assigned, navigate to proofreading interface (for now just prevent modal)
      if (assignmentStatus === 'assigned') {
        // TODO: Navigate to proofreading interface
        console.log(
          'Navigate to proofreading interface for course:',
          course.id,
        );
        return;
      }
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset request state when modal is closed, but keep the assignment status
    setTimeout(() => {
      setIsRequesting(false);
      setIsRequested(false);
    }, 300); // Small delay to allow modal close animation
  };

  const handleSendRequest = async () => {
    if (isRequesting || isRequested) return;

    setIsRequesting(true);
    try {
      await trpcClient.user.translation.requestTranslationAssignment.mutate({
        courseId: course.id,
        language: targetLanguage,
      });
      setIsRequested(true);

      // Update existing assignment state to reflect the new request status
      setExistingAssignment({ status: 'requested' });

      // Refetch user contributions to update the UI
      if (refetchUserContributions) {
        await refetchUserContributions();
      }

      // Keep modal open to show success state
    } catch (error) {
      console.error('Error requesting assignment:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  // Get course details
  const courseName = course.name || '';
  // Use topic field directly instead of categories
  const courseCategory = course.index || 'BITCOIN';
  // Use originalLanguage from course data
  const originalLanguage = course.originalLanguage || 'en';

  // Determine if we should show English content status
  // Don't show if original language is English or if target language is English
  const shouldShowEnglishContentStatus =
    originalLanguage !== 'en' &&
    targetLanguage.toLowerCase() !== 'en' &&
    targetLanguage.toLowerCase() !== 'english' &&
    hasEnglishTranslation;

  // Get button text based on assignment status
  const getButtonText = () => {
    if (assignmentStatus === 'assigned') {
      return t('translate.startTranslating'); // "Start proofreading"
    }
    if (assignmentStatus === 'requested') {
      return t('translate.requestAlreadySent'); // "Request already sent"
    }
    return t('translate.translateContent'); // "Proofread content"
  };

  // Determine if button should be clickable
  const isButtonClickable = assignmentStatus === 'assigned' || !hasAssignment;

  // Get assignment status display text and styling
  const getAssignmentDisplay = () => {
    if (assignmentStatus === 'assigned') {
      return {
        text: t('translate.assigned'),
        className: 'bg-orange-200 text-orange-800',
      };
    }
    if (assignmentStatus === 'requested') {
      return {
        text: t('translate.requestSent'),
        className: 'bg-yellow-100 text-yellow-800',
      };
    }
    return {
      text: t('translate.notAssigned'),
      className: 'bg-gray-200 text-gray-800',
    };
  };

  const assignmentDisplay = getAssignmentDisplay();

  return (
    <>
      <button
        type="button"
        onClick={handleCourseClick}
        onKeyDown={handleKeyDown}
        className="group w-full max-w-[330px] cursor-pointer text-left"
        aria-label={`Translate course: ${courseName}`}
      >
        <div className="rounded-3xl overflow-hidden shadow-md bg-gray-100 border border-transparent group-hover:border-orange-300 transition-all duration-200 relative">
          {/* Course image with padding */}
          <div className="pt-2 px-2 relative">
            <div className="h-48 overflow-hidden rounded-t-2xl">
              <Image
                src={assetUrl(
                  `courses/${course.index}`,
                  'thumbnail.webp',
                  course.lastCommit,
                )}
                alt={courseName}
                className="w-full h-full object-cover"
                breakpoints={{ default: 400 }}
              />

              {/* Language flags - positioned in the top-right corner of the image */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {/* Original language flag */}
                <div className="shadow-sm bg-white rounded overflow-hidden">
                  <Flag code={originalLanguage} size="s" />
                </div>

                {/* English flag - only if course has English translation and original is not English */}
                {originalLanguage !== 'en' && hasEnglishTranslation && (
                  <div className="shadow-sm bg-white rounded overflow-hidden mt-1">
                    <Flag code="en" size="s" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course details */}
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              {courseName}
            </h3>

            {/* Category and assignment tags - category on left, assignment on right */}
            <div className="mb-3 flex justify-between items-start">
              <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded uppercase">
                {courseCategory}
              </span>
              <span
                className={`inline-block text-xs font-medium px-2.5 py-1 rounded ${assignmentDisplay.className}`}
              >
                {assignmentDisplay.text}
              </span>
            </div>

            {/* Course information */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {t('translate.originalLanguage')}
                </span>
                <span className="font-medium">
                  {getLanguageName(originalLanguage)}
                </span>
              </div>
            </div>
          </div>

          {/* Action indicator - shows on hover without nested interactive elements */}
          <div className="h-0 group-hover:h-16 transition-all duration-200 overflow-hidden">
            <div className="px-4 pt-1 pb-5">
              <div
                className={`w-full py-2 px-4 rounded flex items-center justify-center transition-colors ${
                  isButtonClickable
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                {getButtonText()}
                {isButtonClickable && <FaArrowRightLong className="ml-2" />}
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Translation Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={handleCloseModal}
            >
              ×
            </button>

            {/* Logo and header */}
            <div className="flex flex-col items-center mb-5">
              <img
                src={PlanBLogoBlack}
                alt="Plan B Network"
                className="h-8 mb-4"
              />
              <h2 className="text-orange-500 text-lg font-medium">
                {t('translate.modal.requestToProofreadCourse')}
              </h2>
              <div className="text-orange-500 text-4xl mt-4 mb-2">
                <HiOutlineViewGrid />
              </div>
              <p className="text-gray-700 text-center">
                {t('translate.modal.doYouWantToSendRequest')}
              </p>
            </div>

            {/* Course details */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-700 font-medium">
                      {t('translate.modal.course')}:
                    </span>
                    <span className="text-gray-800 ml-2">{courseName}</span>
                  </div>
                  <span className="bg-orange-100 text-xs rounded px-1 py-0.5 text-orange-800">
                    {courseCategory}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    {t('translate.modal.originalLanguage')}:
                  </span>
                  <span className="text-gray-800">
                    {getLanguageName(originalLanguage)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    {t('translate.modal.languageToProofread')}:
                  </span>
                  <span className="text-gray-800">
                    {getLanguageName(targetLanguage)}
                  </span>
                </div>
              </div>
            </div>

            {/* English content status - only show if applicable */}
            {shouldShowEnglishContentStatus && (
              <div className="mb-6">
                <div
                  className={`rounded-lg p-3 flex items-center space-x-3 ${
                    hasEnglishTranslation
                      ? 'bg-orange-100 border border-orange-200'
                      : 'bg-gray-100 border border-gray-200'
                  }`}
                >
                  {hasEnglishTranslation && (
                    <div className="text-orange-500">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <span
                    className={`text-sm ${
                      hasEnglishTranslation
                        ? 'text-orange-800'
                        : 'text-gray-600'
                    }`}
                  >
                    {t('translate.modal.englishContentIncluded')}
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-3">
              {isRequested ? (
                <>
                  <button
                    type="button"
                    className="flex-1 bg-green-100 text-green-800 py-2 px-4 rounded border border-green-300"
                    disabled
                  >
                    {t('translate.modal.requestSentSuccess')}
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                    onClick={handleCloseModal}
                  >
                    {t('translate.modal.close')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                    onClick={handleCloseModal}
                    disabled={isRequesting}
                  >
                    {t('translate.modal.cancel')}
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSendRequest}
                    disabled={isRequesting}
                  >
                    {isRequesting
                      ? t('translate.requesting')
                      : t('translate.modal.sendRequest')}
                  </button>
                </>
              )}
            </div>

            {/* Success message */}
            {isRequested && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 text-center">
                  {t('translate.modal.onceRequestApproved')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
