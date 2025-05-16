import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '#src/components/layouts/main-layout.tsx';

export const Route = createFileRoute('/$lang/content/translate/$courseId')({
  component: CourseTranslatePage,
});

// Default export for TanStack Router
export default Route;

function CourseTranslatePage() {
  const { t } = useTranslation();

  return (
    <MainLayout variant="dark" footerVariant="light">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-6">
          {t('translate.translateCourse')}
        </h1>
        <p>Course translation interface coming soon</p>
      </div>
    </MainLayout>
  );
}
