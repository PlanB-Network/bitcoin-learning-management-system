import { useEffect, useState } from 'react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className="fixed bottom-10 right-10 z-50 transition-opacity duration-1000 ease-in-out"
      style={{
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      <div className="relative h-12 w-12">
        <div
          className="absolute inset-0 z-10 scale-[1.15] rounded-full"
          style={{
            background: `conic-gradient(rgba(242, 135, 13, 1) 0% ${scrollPercentage}%, transparent ${scrollPercentage}% 100%)`,
          }}
        ></div>

        <button
          onClick={scrollToTop}
          className="bg-blue-800 relative z-20 flex h-12 w-12 items-center justify-center rounded-full text-white"
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default ScrollToTopButton;
