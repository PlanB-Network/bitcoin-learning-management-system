import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { IoIosArrowForward } from 'react-icons/io';

const Breadcrumbs = ({ blogTitle }: { blogTitle: string }) => {
  const { t } = useTranslation();

  if (!blogTitle) {
    return null;
  }

  return (
    <nav className="breadcrumbs">
      <ol className="breadcrumb flex flex-row items-center mb-5">
        <li className="breadcrumb-item text-black text-sm">
          <Link className="text-sm" to="/public-communication">
            {t('publicCommunication.blogPost')}
          </Link>
        </li>

        <IoIosArrowForward size={14} className="text-black mx-1" />
        <li className="breadcrumb-item text-newBlack-5 text-sm truncate w-[150px] lg:w-auto">
          {blogTitle}
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
