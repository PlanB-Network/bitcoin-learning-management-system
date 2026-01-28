import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TbChevronLeft } from 'react-icons/tb';

const Breadcrumbs = () => {
  const { t } = useTranslation();

  return (
    <Link
      className="flex items-center text-neutral-300 mb-2 lg:mb-3 lg:px-1 lg:py-1.5 body-small-bold w-fit"
      to="/news"
      viewTransition
    >
      <TbChevronLeft className="m-1 lg:m-1.5 size-4 lg:size-6 shrink-0" />
      {t('news.news')}
    </Link>
  );
};

export default Breadcrumbs;
