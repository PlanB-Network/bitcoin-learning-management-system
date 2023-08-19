import { Popover, Transition } from '@headlessui/react';
import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { compose } from '../../../../utils';
import { MenuElement } from '../../MenuElement';
import { NavigationSection } from '../../props';
import { FlyingMenuSubSection } from '../FlyingMenuSubSection';

export interface FlyingMenuProps {
  section: NavigationSection;
}

export const FlyingMenuSection = ({ section }: FlyingMenuProps) => {
  const [open, setOpen] = useState(false);
  const currentSection = '/'.concat(
    window.location.pathname.split('/').slice(0, 2).join('')
  );

  const sectionTitle = useMemo(() => {
    if ('path' in section) {
      const fontWeight =
        currentSection &&
        currentSection !== '/' &&
        section.path.includes(currentSection)
          ? 'font-semibold'
          : 'font-light';

      return (
        <Link
          className={compose(
            'text-base text-white uppercase xl:text-lg',
            fontWeight
          )}
          to={section.path}
        >
          {section.title}
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

    return (
      <Popover.Button className="inline-flex items-center gap-x-1 text-base font-semibold leading-6 lg:text-lg">
        {section.title}
      </Popover.Button>
    );
  }, [currentSection, section]);

  if (!('items' in section)) return sectionTitle;

  const hasMultipleSubSection = section.items.length > 1;

  return (
    <Popover
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative"
    >
      {sectionTitle}
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
          className={compose(
            'flex fixed z-10 px-4 mt-5 w-screen max-w-max',
            hasMultipleSubSection ? 'left-1/2 -translate-x-1/2' : ''
          )}
        >
          <div className="w-screen max-w-max flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-600/5">
            <div className="flex flex-row">
              {'items' in section &&
                section.items.map((subSectionOrElement, index) => {
                  return 'items' in subSectionOrElement ? (
                    <FlyingMenuSubSection
                      key={subSectionOrElement.id}
                      subSection={subSectionOrElement}
                    />
                  ) : (
                    <div className="mx-2 my-4" key={subSectionOrElement.id}>
                      <MenuElement element={subSectionOrElement} />
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
