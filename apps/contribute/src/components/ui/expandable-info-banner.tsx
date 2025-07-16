import { useState } from 'react';
import type React from 'react';

import InfoIcon from '#src/assets/icons/info.svg';

interface ExpandableInfoBannerProps {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const ExpandableInfoBanner = ({
  title = 'General information',
  children,
  defaultOpen = false,
  className = '',
}: ExpandableInfoBannerProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`mb-8 border rounded-lg ${className}`}
      style={{ backgroundColor: '#E5E5E5', borderColor: '#E5E5E5' }}
    >
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 focus:outline-none"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <img src={InfoIcon} alt="Info" className="w-4 h-4" />
          <span className="font-medium text-gray-900 text-sm md:text-base">
            {title}
          </span>
        </div>
        {/* Chevron */}
        <svg
          className={`w-3 h-3 transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          role="img"
          aria-labelledby="toggleBannerTitle"
        >
          <title id="toggleBannerTitle">Toggle banner</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content */}
      {open && (
        <div className="px-4 pb-4 text-gray-700 text-sm whitespace-normal">
          {children}
        </div>
      )}
    </div>
  );
};
