import { useEffect, useState } from 'react';
import { IoIosArrowUp } from 'react-icons/io';

const ScrollToTopButton = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      className={`fixed bottom-4 right-4 bg-orange-500 text-white p-2 rounded-full shadow-lg transition-opacity duration-300 z-50 ${
        showButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <IoIosArrowUp size={24} />
    </button>
  );
};

export default ScrollToTopButton;
