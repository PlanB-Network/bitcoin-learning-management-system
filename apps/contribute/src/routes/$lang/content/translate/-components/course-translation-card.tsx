import { Button } from '@blms/ui';
import { useNavigate } from '@tanstack/react-router';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowRightLong } from 'react-icons/fa6';
import { TranslationRequestModal } from '#src/components/translation-request-modal.tsx';

import type { BasicCourse } from '@blms/types';

import { Image } from '#src/components/image.tsx';
import Flag from '#src/molecules/Flag/index.tsx';
import { getLanguageName } from '#src/utils/i18n.ts';
import { assetUrl } from '#src/utils/index.ts';
import { trpcClient } from '#src/utils/trpc.ts';

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
  onRequestSuccess?: () => void;
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
  onRequestSuccess,
}: CourseTranslationCardProps): JSX.Element => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasEnglishTranslation, setHasEnglishTranslation] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  // Video creation progress percentage (0-100)
  const [progress, setProgress] = useState<number | null>(null);

  // Get target language from localStorage or prop
  const [targetLanguage] = useState<string>(() => {
    return propTargetLanguage || localStorage.getItem('targetLanguage') || 'en';
  });

  // Fetch translation chapter progress to compute video creation progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const chapters =
          await trpcClient.content.getCourseTranslationChapterProgress.query({
            courseId: course.id,
            language: targetLanguage.toLowerCase(),
          });

        if (!chapters || chapters.length === 0) {
          setProgress(0);
          return;
        }

        const totals = chapters.reduce(
          (
            acc: { total: number; completed: number },
            chapter: { totalSlides: number; completedSlides: number },
          ) => {
            acc.total += chapter.totalSlides;
            acc.completed += chapter.completedSlides;
            return acc;
          },
          { total: 0, completed: 0 },
        );

        const percent =
          totals.total === 0
            ? 0
            : Math.round((totals.completed / totals.total) * 100);
        setProgress(percent);
      } catch (err) {
        console.warn('Failed to fetch chapter progress', err);
        setProgress(null);
      }
    };

    fetchProgress();
  }, [course.id, targetLanguage]);

  // Find user's contribution for this course
  const userContribution = userContributions?.find(
    (contribution) => contribution.courseId === course.id,
  );

  // State for existing assignment check
  const [existingAssignment, setExistingAssignment] =
    useState<TranslationAssignment | null>(null);

  // Check if user has existing translation assignment
  useEffect(() => {
    const checkExistingAssignment = async () => {
      // Only check if not already in contributions
      if (!course.id || !targetLanguage || userContribution) return;

      try {
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
      }
    };

    checkExistingAssignment();
  }, [course.id, targetLanguage, userContribution]);

  // Determine the assignment status
  const assignmentStatus =
    userContribution?.assignmentStatus || existingAssignment?.status;
  const hasAssignment = !!userContribution || !!existingAssignment;

  // Check if an English version of this course is published
  useEffect(() => {
    const checkEnglishAvailability = async () => {
      try {
        const resp = await trpcClient.content.getCourseLanguagesPublic.query({
          id: course.id,
        });
        const hasEn = resp?.languages?.some(
          (l: any) => l.code?.toLowerCase() === 'en',
        );
        // If original language is English, we also consider English version available
        setHasEnglishTranslation(hasEn || course.originalLanguage === 'en');
      } catch (err) {
        console.warn('Could not fetch course languages', err);
        // Fallback: assume unavailable to avoid false positive
        setHasEnglishTranslation(course.originalLanguage === 'en');
      }
    };

    checkEnglishAvailability();
  }, [course.id, course.originalLanguage]);

  // Handle course selection
  const handleCourseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Don't open modal if user has a pending request
    if (assignmentStatus === 'requested') {
      return;
    }
    // If assigned, navigate to proofreading interface
    if (assignmentStatus === 'assigned') {
      navigate({
        to: '/$lang/content/translate/$courseId',
        params: {
          lang: i18n.language,
          courseId: course.id,
        },
      });
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
      // If assigned, navigate to proofreading interface
      if (assignmentStatus === 'assigned') {
        navigate({
          to: '/$lang/content/translate/$courseId',
          params: {
            lang: i18n.language,
            courseId: course.id,
          },
        });
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

      // Close request modal and notify parent
      setIsModalOpen(false);
      if (onRequestSuccess) onRequestSuccess();
    } catch (error) {
      console.error('Error requesting assignment:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  // Get course details
  const courseName = course.name || '';
  // Use topic field from course data instead of course code/index
  const courseTopic = course.topic || 'BITCOIN';
  // Use originalLanguage from course data
  const originalLanguage = course.originalLanguage || 'en';

  // no longer used banner; flag kept for internal badge

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
      <div
        onClick={handleCourseClick}
        onKeyDown={handleKeyDown}
        className="group w-full cursor-pointer text-left"
        aria-label={`Translate course: ${courseName}`}
      >
        <div className="rounded-3xl overflow-hidden border border-transparent group-hover:border-orange-300 transition-all duration-200 relative bg-[#E5E5E5] group-hover:shadow-[0_0_8px_0_#FF5C00]">
          {/* Course image with padding */}
          <div className="pt-2 px-2 relative">
            <div className="h-48 overflow-hidden rounded-lg">
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
              <div className="absolute top-4 right-4 flex flex-col gap-1">
                {/* Original language flag */}
                <div className="shadow-sm bg-white rounded overflow-hidden px-[6px] py-[4px]">
                  {/* Increased flag size and added internal white padding for better visibility */}
                  <Flag code={originalLanguage} size="m" />
                </div>

                {/* English flag - only if course has English translation and original is not English */}
                {originalLanguage !== 'en' && hasEnglishTranslation && (
                  <div className="shadow-sm bg-white rounded overflow-hidden mt-1 px-[6px] py-[4px]">
                    {/* Enlarged English flag and increased padding */}
                    <Flag code="en" size="m" />
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
                {courseTopic}
              </span>
              <span
                className={`inline-block text-xs font-medium px-2.5 py-1 rounded ${assignmentDisplay.className}`}
              >
                {assignmentDisplay.text}
              </span>
            </div>

            {/* Course information */}
            <div className="flex flex-col space-y-2">
              {/* Video creation progress row */}
              <div className="flex justify-between text-sm">
                <span className="text-maroon-8">
                  {t('translate.videoGeneration.title', {
                    defaultValue: 'Video creation progress',
                  })}
                </span>
                <span className="font-medium text-black">
                  {progress !== null ? `${progress}%` : '—'}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-maroon-8">
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
            <div className="px-4 py-4">
              <Button
                variant="primary"
                size="flagsMobile"
                disabled={!isButtonClickable}
                className={`w-full h-[32px] px-[10px] py-[14px] gap-[10px] rounded-[8px] !shadow-none transition-colors ${
                  isButtonClickable
                    ? ''
                    : '!bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                {getButtonText()}
                {isButtonClickable && <FaArrowRightLong />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Translation Request Modal */}
      <TranslationRequestModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        courseName={courseName}
        courseTopic={courseTopic}
        originalLanguage={originalLanguage}
        targetLanguage={targetLanguage}
        hasEnglishTranslation={hasEnglishTranslation}
        isRequested={isRequested}
        isRequesting={isRequesting}
        onSendRequest={handleSendRequest}
      />
    </>
  );
};
