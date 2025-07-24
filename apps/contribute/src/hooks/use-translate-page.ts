import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  filterCoursesByTopic,
  getUniqueTopics,
} from '../utils/course-filters.ts';
import { useCourseTranslations } from './use-course-translations.ts';

export type ViewMode = 'courses' | 'contributions';

export const useTranslatePage = () => {
  const { i18n } = useTranslation();

  // State for view mode (courses to translate or user contributions)
  const [viewMode, setViewMode] = useState<ViewMode>('courses');

  // State for selected topic filter
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  // Get course translations data
  const {
    courses,
    allCourses,
    translations,
    userContributions,
    targetLanguage,
    setTargetLanguage,
    isLoading,
    refetchUserContributions,
  } = useCourseTranslations();

  // Extract unique topics from courses
  const uniqueTopics = getUniqueTopics(courses);

  // Filter courses by topic (courses are already filtered for translatability in useCourseTranslations)
  const filteredCourses = filterCoursesByTopic(courses, selectedTopic);

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Save target language to localStorage when it changes
  const handleTargetLanguageChange = (language: string) => {
    setTargetLanguage(language);
    localStorage.setItem('targetLanguage', language);
  };

  return {
    // State
    viewMode,
    selectedTopic,
    targetLanguage,

    // Data
    courses,
    allCourses,
    translations,
    userContributions,
    uniqueTopics,
    filteredCourses,
    isLoading,

    // Actions
    handleTopicSelect,
    toggleViewMode,
    handleTargetLanguageChange,
    refetchUserContributions,

    // Utils
    i18n,
  };
};
