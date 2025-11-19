import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import lostRabbit from '#src/assets/icons/404.svg';
import { PageLayout } from './page-layout.tsx';

export function NotFound() {
  const { t } = useTranslation();

  return (
    <PageLayout title={t('notFound.pageTitle')} layoutSize="small">
      <p className="body-base-bold mb-10">
        {t('notFound.pageSubtitle')}
        <Link className="ml-1 underline" to="/">
          {t('notFound.here')}
        </Link>
        .
      </p>
      <img
        src={lostRabbit}
        className="w-full max-w-xl"
        alt={t('imagesAlt.rabbit404')}
      />
    </PageLayout>
  );
}
