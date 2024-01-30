import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CourseButtonProps {
  courseId: string; // Establece el tipo de firstChapterRoute como string
}

export const CourseButton: React.FC<CourseButtonProps> = ({ courseId }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      toggleVisibility();
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className="fixed bottom-10 left-10 z-50 transition-opacity duration-1000 ease-in-out sm:hidden"
      style={{
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      <div className="relative flex h-12 w-auto">
        <Link
          to={'/courses/$courseId/$partIndex/$chapterIndex'}
          params={{
            courseId,
            partIndex: '1',
            chapterIndex: '1',
          }}
        >
          <button className="relative z-10 flex h-12 w-auto items-center justify-center rounded-full bg-orange-500 text-white">
            <span className="m-2 px-2 text-sm font-normal md:px-3">
              {t('courses.preview.letsgo')}
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
};
