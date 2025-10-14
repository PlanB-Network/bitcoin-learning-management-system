import { useEffect, useState } from 'react';
import { TbArrowUp } from 'react-icons/tb';

const scrollToTop = () => {
  window.scrollTo({
    behavior: 'smooth',
    top: 0,
  });
};

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY > 200 && window.scrollY < totalHeight - 150) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      toggleVisibility();

      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const percentageScrolled = (scrollPosition / totalHeight) * 100;
      setScrollPercentage(percentageScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className="fixed bottom-10 min-[1440px]:right-[calc((100vw-1440px)/2+40px)] right-10 z-50 transition-opacity duration-1000 ease-in-out"
      style={{
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      <div className="relative size-12">
        <div
          className="absolute inset-0 z-10 scale-[1.15] rounded-full"
          style={{
            background: `conic-gradient(#FF5C00 0% ${scrollPercentage}%, transparent ${scrollPercentage}% 100%)`,
          }}
        />

        <button
          type="button"
          onClick={scrollToTop}
          className="relative z-20 flex size-12 items-center justify-center rounded-full bg-brown-100 text-black"
        >
          <TbArrowUp size={20} />
        </button>
      </div>
    </div>
  );
};

export { ScrollToTopButton };
