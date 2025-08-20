import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown } from 'react-icons/fi';
import { useDisclosure } from '../../../hooks/use-disclosure.ts';
import { isRTL } from '../../../utils/i18n.ts';
import { compose } from '../../../utils/index.ts';
import type { NavigationSectionMobile } from '../props.ts';
import { MobileMenuSectionElement } from './mobile-menu-section-elements.tsx';

export interface MobileMenuSectionProps {
  section: NavigationSectionMobile;
}

export const MobileMenuSection = ({ section }: MobileMenuSectionProps) => {
  const { i18n } = useTranslation();
  const rtl = isRTL(i18n.language);
  const { toggle, isOpen } = useDisclosure();
  const titleClass = section.title === 'login' ? '' : 'italic';
  const sectionTitle = useMemo(() => {
    if ('path' in section) {
      return (
        <Link
          className="group flex items-center text-newBlack-1 dark:text-white text-lg font-medium p-2 gap-4 w-full"
          to={section.path}
        >
          {section.mobileIcon && (
            <img
              src={section.mobileIcon}
              alt={section.title}
              className={cn(
                'size-6 shrink-0',
                section.removeFilterOnIcon
                  ? ''
                  : ' filter-black dark:filter-white',
              )}
            />
          )}
          <span className="truncate">{section.title}</span>
        </Link>
      );
    }

    if ('action' in section) {
      return (
        <button
          type="button"
          onClick={section.action}
          className="group flex items-center text-newBlack-1 dark:text-white text-lg font-medium p-2 gap-4 w-full"
        >
          {section.mobileIcon && (
            <img
              src={section.mobileIcon}
              alt={section.title}
              className={cn(
                'size-6 shrink-0',
                section.removeFilterOnIcon
                  ? ''
                  : ' filter-black dark:filter-white',
              )}
            />
          )}
          <span className={cn('truncate', titleClass)}>{section.title}</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => toggle()}
        className="group flex items-center text-newBlack-1 dark:text-white text-lg font-medium p-2 gap-4 w-full"
      >
        {section.mobileIcon && (
          <img
            src={section.mobileIcon}
            alt={section.title}
            className={cn(
              'size-6 shrink-0',
              section.removeFilterOnIcon
                ? ''
                : ' filter-black dark:filter-white',
            )}
          />
        )}
        <span className="truncate">{section.title}</span>
        <FiChevronDown
          className={cn(
            'p-0 m-0 w-6 h-6 duration-300',
            isOpen ? 'rotate-180' : 'rotate-0',
            rtl ? 'mr-auto' : 'ml-auto',
          )}
        />
      </button>
    );
  }, [isOpen, section, toggle]);

  return (
    <li key={section.id} className={cn('overflow-hidden')}>
      {sectionTitle}
      {'items' in section && (
        <div
          className={compose(
            'overflow-hidden flex flex-col gap-1 mt-2.5',
            isOpen ? '' : 'hidden',
          )}
        >
          {section?.items?.map((element) => (
            <MobileMenuSectionElement key={element.id} element={element} />
          ))}
        </div>
      )}
    </li>
  );
};
