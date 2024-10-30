import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

import { Loader } from '@blms/ui';

import { BCertificatePresentation } from '#src/components/b-certificate-presentation.js';
import { PageLayout } from '#src/components/page-layout.js';
import { trpc } from '#src/utils/trpc.ts';

import { CourseSelector } from './-components/course-selector.tsx';
import { CoursesGallery } from './-components/courses-gallery.tsx';

export const Route = createFileRoute('/_content/courses/')({
  component: CoursesExplorer,
});

function CoursesExplorer() {
  const { i18n } = useTranslation();
  const {
    data: courses,
    isFetched,
    isLoading,
    error,
  } = trpc.content.getCourses.useQuery(
    {
      language: i18n.language,
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  if (isLoading) {
    return <Loader size={'s'} />;
  }

  if (error) {
    return (
      <div>
        <Loader size={'s'} />
        <p>Error loading courses: {error.message}</p>
      </div>
    );
  }

  return (
    <PageLayout
      title={t('courses.explorer.exploreCourses')}
      subtitle={t('courses.explorer.journey')}
      description={t('courses.explorer.pageDescription')}
      paddingXClasses="px-2.5 md:px-4"
      maxWidth="max-w-[1227px]"
    >
      {!isFetched && <Loader size={'s'} />}

      {courses && <CoursesGallery courses={courses} />}
      <div className="border-t border-newGray-1 max-w-[1115px] w-full mx-auto"></div>
      <div className="py-5 lg:py-[60px]">
        <BCertificatePresentation marginClasses="mt-0" />
      </div>
      <div className="border-t border-newGray-1 max-w-[1115px] w-full mx-auto"></div>

      {courses && (
        <>
          <p className="mobile-h3 md:desktop-h6 max-w-[451px] text-center mx-auto mt-6 mb-5 md:mt-16 md:mb-10">
            {t('courses.explorer.findCourses')}
          </p>
          <CourseSelector courses={courses} />
        </>
      )}
    </PageLayout>
  );
}
