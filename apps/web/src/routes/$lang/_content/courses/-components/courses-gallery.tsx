import { useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import type { JoinedCourse } from '@blms/types';
import { Button } from '@blms/ui';

import { CourseCard } from '#src/organisms/course-card.tsx';
import { FilterDropdown } from '#src/organisms/filter-dropdown.tsx';

import { useTranslation } from 'react-i18next';
import { toCamelCase } from '#src/utils/string.ts';
import { toggleSelection } from '#src/utils/toggle.ts';

export const CoursesGallery = ({ courses }: { courses: JoinedCourse[] }) => {
  const { t, i18n } = useTranslation();

  const uniqueTopics = Array.from(
    new Set(courses.map((course) => course.topic)),
  ).sort((a, b) => a.localeCompare(b));

  const topics = [
    { name: 'all', translation: t('words.all') },
    ...uniqueTopics.map((topic: string) => ({
      name: topic,
      translation: t(`words.${toCamelCase(topic)}`),
    })),
  ];

  const levels = [
    { name: 'all', translation: t('words.all') },
    { name: 'beginner', translation: t('words.level.beginner') },
    { name: 'intermediate', translation: t('words.level.intermediate') },
    { name: 'advanced', translation: t('words.level.advanced') },
    { name: 'wizard', translation: t('words.level.wizard') },
  ];

  const mobileLevels = [
    { name: 'all', translation: t('words.all') },
    { name: 'advanced', translation: t('words.level.advanced') },
    { name: 'beginner', translation: t('words.level.beginner') },
    { name: 'wizard', translation: t('words.level.wizard') },
    { name: 'intermediate', translation: t('words.level.intermediate') },
  ];

  const [filteredCourses, setFilteredCourses] = useState<JoinedCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const featuredCourseId = 'btc101';

  const {
    topics: searchedTopics = 'all',
    levels: searchedLevels = 'all',
  }: { topics: string; levels: string } = useSearch({
    strict: false,
  });

  const getDefaultValues = (
    options: { name: string }[],
    searchedValues?: string,
  ) => {
    const validValues = options.map((option) => option.name);
    const separatedValues = searchedValues
      ? searchedValues.split(',').map((value) => value.replaceAll('+', ' '))
      : [];

    return separatedValues.every((value) => validValues.includes(value))
      ? new Set(separatedValues.map((value) => value.replaceAll('+', ' ')))
      : new Set(['all']);
  };

  const [activeTopics, setActiveTopics] = useState<Set<string>>(
    getDefaultValues(topics, searchedTopics),
  );
  const [activeLevels, setActiveLevels] = useState<Set<string>>(
    getDefaultValues(levels, searchedLevels),
  );

  // Commented out until issue https://github.com/TanStack/router/issues/3408 is resolved
  // const navigate = useNavigate();

  // useEffect(() => {
  //   const search = new URLSearchParams(window.location.search);

  //   const topicsArray = Array.from(activeTopics);
  //   search.set('topics', topicsArray.join(','));

  //   const levelsArray = Array.from(activeLevels);
  //   search.set('levels', levelsArray.join(','));

  //   navigate({
  //     to: '.',
  //     search: Object.fromEntries(search),
  //     resetScroll: false,
  //   });
  // }, [activeTopics, activeLevels]);

  useEffect(() => {
    const reorderedCourses = [
      ...courses.filter((course) => course.id === featuredCourseId),
      ...courses.filter((course) => course.id !== featuredCourseId),
    ];

    setFilteredCourses(
      reorderedCourses.filter(
        (course) =>
          (activeTopics.has('all') || activeTopics.has(course.topic)) &&
          (activeLevels.has('all') || activeLevels.has(course.level)) &&
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          course.language === i18n.language,
      ),
    );
  }, [courses, activeTopics, activeLevels, searchQuery]);

  const handleFilterChange = (category: string, option: string) => {
    if (category === 'Topics') {
      toggleSelection(option, activeTopics, setActiveTopics);
    } else if (category === 'Levels') {
      toggleSelection(option, activeLevels, setActiveLevels);
    }
  };

  const featuredCourse = filteredCourses.find(
    (course) => course.id === featuredCourseId,
  );
  const otherCourses = filteredCourses.filter(
    (course) => course.id !== featuredCourseId,
  );

  return (
    <>
      <div className="md:mt-12 max-w-[730px] lg:max-w-[1126px] mx-auto">
        <p className="desktop-h6 mb-5">{t('courses.explorer.buildPath')}</p>
        <div className="max-md:hidden flex flex-col p-5 gap-8 bg-tertiary-10 rounded-[20px] max-w-[1126px] mx-auto">
          <div className="flex items-center gap-8 font-medium">
            <p>{t('words.topics')}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTopics.has('all') ? 'primary' : 'outlineWhite'}
                size="s"
                onClick={() =>
                  toggleSelection('all', activeTopics, setActiveTopics)
                }
              >
                {t('words.all')}
              </Button>
              {topics.slice(1).map((topic) => (
                <Button
                  key={topic.name}
                  variant={
                    activeTopics.has(topic.name) ? 'primary' : 'outlineWhite'
                  }
                  size="s"
                  onClick={() =>
                    toggleSelection(topic.name, activeTopics, setActiveTopics)
                  }
                  className="capitalize"
                >
                  {topic.translation}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8 font-medium">
            <p>{t('words.level.levels')}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeLevels.has('all') ? 'primary' : 'outlineWhite'}
                size="s"
                onClick={() =>
                  toggleSelection('all', activeLevels, setActiveLevels)
                }
              >
                {t('words.all')}
              </Button>
              {levels.slice(1).map((level) => (
                <Button
                  key={level.name}
                  variant={
                    activeLevels.has(level.name) ? 'primary' : 'outlineWhite'
                  }
                  size="s"
                  onClick={() =>
                    toggleSelection(level.name, activeLevels, setActiveLevels)
                  }
                  className="capitalize"
                >
                  {level.translation}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden w-full max-w-[500px] mx-auto">
        <FilterDropdown
          filters={{
            Topics: topics,
            Levels: mobileLevels,
          }}
          selectedFilters={{
            Topics: activeTopics,
            Levels: activeLevels,
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onChange={handleFilterChange}
          onClear={() => setSearchQuery('')}
        />
      </div>

      <section className="flex justify-center gap-5 md:gap-[50px] flex-wrap mt-8 md:mt-12 mb-5 lg:mb-[60px] max-w-[1226px] mx-auto">
        {featuredCourse && <CourseCard course={featuredCourse} featured />}
        {otherCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </section>
    </>
  );
};
