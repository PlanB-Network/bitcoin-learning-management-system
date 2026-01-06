import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TbChevronLeft } from 'react-icons/tb';

const Breadcrumbs = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center text-neutral-300 mb-2 lg:mb-3 lg:px-1 lg:py-1.5">
      <TbChevronLeft className="m-1 lg:m-1.5 size-4 lg:size-6" />
      <Link className="body-small-bold" to="/news" viewTransition>
        {t('news.news')}
      </Link>
    </div>
  );
};

export default Breadcrumbs;
