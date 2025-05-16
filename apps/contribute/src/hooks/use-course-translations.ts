import type { AvailableCourseTranslation } from '@blms/types';
import { useContext, useEffect, useMemo, useState } from 'react';

import { AppContext } from '#src/providers/context.js';
import { trpcClient } from '#src/utils/trpc.ts';

export const useCourseTranslations = () => {
  const { courses: basicCourses } = useContext(AppContext);

  // Get the target language from localStorage - this is the language we want to translate TO
  const [targetLanguage, setTargetLanguage] = useState<string>(() => {
    const saved = localStorage.getItem('targetLanguage');
    if (!saved) {
      console.warn(
        'No targetLanguage found in localStorage. Please select a target language first.',
      );
      return 'en'; // Default fallback, but this should be set by user selection
    }
    return saved;
  });

  // State for managing data and loading
  const [coursesReadyForReview, setCoursesReadyForReview] = useState<
    AvailableCourseTranslation[]
  >([]);
  const [userContributions, setUserContributions] = useState<
    Array<{ courseId: string; assignmentStatus?: string }> | undefined
  >(undefined);
  const [isLoadingCoursesReady, setIsLoadingCoursesReady] = useState(false);
  const [isLoadingContributions, setIsLoadingContributions] = useState(false);
  const [coursesReadyError, setCoursesReadyError] = useState<Error | null>(
    null,
  );
  const [contributionsError, setContributionsError] = useState<Error | null>(
    null,
  );

  // Fetch courses ready for review
  useEffect(() => {
    const fetchCoursesReadyForReview = async () => {
      try {
        setIsLoadingCoursesReady(true);
        setCoursesReadyError(null);
        const data = await trpcClient.content.getCoursesReadyForReview.query({
          language: targetLanguage.toLowerCase(),
        });
        setCoursesReadyForReview(data || []);
      } catch (error) {
        console.error('Failed to fetch courses ready for review:', error);
        setCoursesReadyError(
          error instanceof Error ? error : new Error('Unknown error'),
        );
        setCoursesReadyForReview([]);
      } finally {
        setIsLoadingCoursesReady(false);
      }
    };

    fetchCoursesReadyForReview();
  }, [targetLanguage]);

  // Fetch user contributions under review
  useEffect(() => {
    const fetchUserContributions = async () => {
      try {
        setIsLoadingContributions(true);
        setContributionsError(null);
        const data =
          await trpcClient.content.getUserContributionsUnderReview.query({
            language: targetLanguage.toLowerCase(),
          });
        setUserContributions(data || []);
      } catch (error) {
        console.error('Failed to fetch user contributions:', error);
        setContributionsError(
          error instanceof Error ? error : new Error('Unknown error'),
        );
        setUserContributions([]);
      } finally {
        setIsLoadingContributions(false);
      }
    };

    fetchUserContributions();
  }, [targetLanguage]);

  // Filter courses that are available for translation based on the new logic
  const availableCourses = useMemo(() => {
    if (!basicCourses || !coursesReadyForReview) {
      return [];
    }

    // Get the set of course IDs that are ready for review
    const readyForReviewCourseIds = new Set(
      coursesReadyForReview.map(
        (translation: AvailableCourseTranslation) => translation.courseId,
      ),
    );

    // Filter courses that:
    // 1. Are not archived
    // 2. Are published
    // 3. Have a different original language than the target language
    // 4. Are ready for review in the target language
    const filtered = basicCourses.filter((course) => {
      // Only include non-archived and published courses
      if (course.isArchived || !course.publishedAt) {
        return false;
      }

      // Exclude courses where the original language is the same as the target language
      if (
        course.originalLanguage.toLowerCase() === targetLanguage.toLowerCase()
      ) {
        return false;
      }

      // Only include courses that are ready for review in the target language
      if (!readyForReviewCourseIds.has(course.id)) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [basicCourses, coursesReadyForReview, targetLanguage]);

  const isLoading = isLoadingCoursesReady || isLoadingContributions;

  const error = coursesReadyError || contributionsError;

  // Log error if it occurs
  if (error) {
    console.warn('Failed to fetch course data:', error.message);
  }

  // Function to refetch user contributions (useful after making changes)
  const refetchUserContributions = async () => {
    try {
      setIsLoadingContributions(true);
      setContributionsError(null);
      const data =
        await trpcClient.content.getUserContributionsUnderReview.query({
          language: targetLanguage.toLowerCase(),
        });
      setUserContributions(data || []);
    } catch (error) {
      console.error('Failed to refetch user contributions:', error);
      setContributionsError(
        error instanceof Error ? error : new Error('Unknown error'),
      );
    } finally {
      setIsLoadingContributions(false);
    }
  };

  return {
    courses: availableCourses,
    allCourses: basicCourses,
    translations: coursesReadyForReview,
    userContributions: userContributions as
      | Array<{ courseId: string; assignmentStatus?: string }>
      | undefined,
    targetLanguage,
    setTargetLanguage,
    isLoading,
    error,
    refetchUserContributions,
  };
};
