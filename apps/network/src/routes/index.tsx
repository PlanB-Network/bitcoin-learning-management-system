import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import PageBlock from '#src/components/page-block.tsx';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <PageBlock>
        <h1 className="text-4xl font-bold mb-8">{t('home.title')}</h1>
      </PageBlock>
    </div>
  );
}
