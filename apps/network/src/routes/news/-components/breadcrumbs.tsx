import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TbChevronLeft } from 'react-icons/tb';

const Breadcrumbs = ({ blogTitle }: { blogTitle: string }) => {
  const { t } = useTranslation();

  if (!blogTitle) {
    return null;
  }

  return (
    <div className="flex items-center text-neutral-100 mb-4">
      <TbChevronLeft size={24} className=" mx-1" />
      <Link className="body-small-bold" to="/news" viewTransition>
        {t('news.news')}
      </Link>
    </div>
  );
};

export default Breadcrumbs;
