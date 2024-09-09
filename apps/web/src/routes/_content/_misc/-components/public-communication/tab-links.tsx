import { Link } from '@tanstack/react-router';
import type React from 'react';
import { useTranslation } from 'react-i18next';

interface Tab {
  id: string;
  label: string;
  href: string;
}

export const TabLinks: React.FC = () => {
  const { t } = useTranslation();

  const mainTabs: Tab[] = [
    {
      id: 'tab1',
      label: 'publicCommunication.blogPost',
      href: '/public-communication/blogs-and-news',
    },
    {
      id: 'tab2',
      label: 'publicCommunication.legal',
      href: '/public-communication/legals',
    },
  ];

  return (
    <div
      className="flex flex-row mx-auto justify-center lg:pb-14 lg:mt-7 border-0 lg:border-b-2 lg:space-x-5 transition-all mb-6 duration-300"
      role="tablist"
    >
      {/* Desktop view */}
      <div className="hidden lg:flex space-x-5">
        {mainTabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.href}
            activeProps={{
              className: 'bg-darkOrange-5 text-white scale-95',
            }}
            inactiveProps={{
              className:
                'text-darkOrange-5 border bg-transparent border-darkOrange-5',
            }}
            className="lg:px-4 lg:py-3.5 lg:text-xl font-normal lg:!font-medium rounded-2xl text-base py-2 px-2.5 transition-colors duration-150"
          >
            {t(tab.label)}
          </Link>
        ))}
      </div>

      {/* Mobile view */}

      <div className="flex lg:hidden md:mb-3">
        {mainTabs.map((tab, index) => (
          <Link
            key={tab.id}
            to={tab.href}
            activeProps={{
              className: '!bg-darkOrange-1 text-darkOrange-5',
            }}
            inactiveProps={{
              className: '',
            }}
            className={`flex items-center justify-center py-1 px-5 text-sm font-medium tabs-sm text-black bg-newGray-5 border border-newGray-4 ${
              index === 0
                ? 'rounded-l-lg'
                : index === mainTabs.length - 1
                  ? 'rounded-r-lg'
                  : 'border-l-0'
            } ${mainTabs.length > 2 && index === 1 ? 'rounded-none' : ''}`}
          >
            {t(tab.label)}
          </Link>
        ))}
      </div>
    </div>
  );
};
