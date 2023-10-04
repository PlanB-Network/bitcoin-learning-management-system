import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import rabbitHikingModal from '../../../assets/rabbit-modal-auth.svg';
import { Routes } from '../../../types';

interface CourseButtonProps {
  firstChapterRoute: string; // Establece el tipo de firstChapterRoute como string
}

export const CourseButton: React.FC<CourseButtonProps> = ({
  firstChapterRoute,
}) => {
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
        <Link to={firstChapterRoute}>
          <button className="relative z-10 flex h-12 w-auto items-center justify-center rounded-full bg-orange-800 text-white">
            <span className="m-2 px-2 text-sm font-normal md:px-3">
              Let's go
            </span>
          </button>
        </Link>
        <img
          src={rabbitHikingModal}
          alt=""
          className="absolute bottom-2 left-1 z-20 h-16 -translate-x-1/2 rounded-full"
        />
      </div>
    </div>
  );
};
