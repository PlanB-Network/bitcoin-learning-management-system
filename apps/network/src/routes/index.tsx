import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { PageLayout } from '#src/components/page-layout.tsx';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  return (
    <PageLayout>
      <div className="text-center">
        <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
          {t('academy.title')}
        </header>
      </div>
    </PageLayout>
  );
}
