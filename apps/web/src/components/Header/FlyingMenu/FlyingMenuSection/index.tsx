import { Popover, Transition } from '@headlessui/react';
import { Link } from '@tanstack/react-router';
import { Fragment, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { cn } from '@sovereign-university/ui';

import { MenuElement } from '../../MenuElement/index.tsx';
import type { NavigationSection } from '../../props.tsx';
import { FlyingMenuSubSection } from '../FlyingMenuSubSection/index.tsx';

export interface FlyingMenuProps {
  section: NavigationSection;
  variant?: 'dark' | 'light';
}
interface SectionTitleProps {
  section: NavigationSection;
  variant?: 'dark' | 'light';
  addArrow?: boolean;
  isOpen?: boolean;
}

const SectionTitle = ({
  section,
  variant = 'dark',
  addArrow,
  isOpen,
}: SectionTitleProps) => {
  const variantMap = {
    light: 'text-darkOrange-10',
    dark: 'text-white',
  };

  if ('path' in section) {
    return (
      <Link
        className={cn(
          'text-base font-medium leading-[144%] flex items-center gap-1.5',
          variantMap[variant],
        )}
        /* TODO: fix */
        to={section.path as '/'}
      >
        {section.title}
        {addArrow && (
          <MdKeyboardArrowDown
            size={24}
            className={cn(
              'transition-transform ease-in-out',
              isOpen && '-rotate-180',
            )}
          />
        )}
      </Link>
    );
  }

  if ('action' in section)
    return (
      <button
        className="inline-flex cursor-pointer items-center gap-x-1 text-base font-semibold leading-6 lg:text-lg"
        onClick={() => {
          section.action();
        }}
      >
        {section.title}
      </button>
    );
};

export const FlyingMenuSection = ({ section, variant }: FlyingMenuProps) => {
  const [open, setOpen] = useState(false);

  if (!('items' in section)) {
    return (
      <div
        className={cn(
          'relative px-2 xl:px-4 py-1.5 rounded-lg hover:bg-white/20',
          open && 'bg-white/20',
        )}
      >
        <SectionTitle section={section} variant={variant} />
      </div>
    );
  }

  const hasMultipleSubSection = section.items.length > 1;

  return (
    <Popover
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={cn(
        'relative px-2 xl:px-4 py-1.5 rounded-lg hover:bg-white/20',
        open && 'bg-white/20',
      )}
    >
      <SectionTitle
        section={section}
        variant={variant}
        addArrow
        isOpen={open}
      />
      <Transition
        show={open}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          static
          className={cn(
            'flex absolute z-10 mt-8 -left-1',
            hasMultipleSubSection ? '-left-40' : '',
          )}
        >
          <div
            className={cn(
              'flex-auto overflow-hidden rounded-[20px]',
              variant === 'light' ? 'bg-darkOrange-4' : 'bg-newBlack-3',
            )}
          >
            <div className="flex flex-row">
              {'items' in section &&
                section.items.map((subSectionOrElement) => {
                  return 'items' in subSectionOrElement ? (
                    <FlyingMenuSubSection
                      key={subSectionOrElement.id}
                      subSection={subSectionOrElement}
                      variant={variant}
                      hasMultipleSubSection={hasMultipleSubSection}
                    />
                  ) : (
                    <div className="mx-2 my-4" key={subSectionOrElement.id}>
                      <MenuElement
                        element={subSectionOrElement}
                        variant={variant}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
