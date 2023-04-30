import { Popover, Transition } from '@headlessui/react';
import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { MenuElement } from '../../MenuElement';
import { NavigationSection } from '../../props';
import { FlyingMenuSubSection } from '../FlyingMenuSubSection';

export interface FlyingMenuProps {
  section: NavigationSection;
}

export const FlyingMenuSection = ({ section }: FlyingMenuProps) => {
  const [open, setOpen] = useState(false);

  const sectionTitle = useMemo(() => {
    if ('path' in section)
      return <Link to={section.path}>link {section.title}</Link>;
    if ('action' in section)
      return (
        <button
          className="inline-flex gap-x-1 items-center text-sm font-semibold leading-6 text-gray-100 cursor-pointer"
          onClick={() => {
            section.action();
          }}
        >
          {section.title}
        </button>
      );

    return (
      <Popover.Button className="inline-flex gap-x-1 items-center text-sm font-semibold leading-6 text-gray-100">
        {section.title}
      </Popover.Button>
    );
  }, [section]);

  if (!('items' in section)) return sectionTitle;

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
          className="flex fixed left-1/2 z-10 px-4 mt-5 w-screen max-w-max -translate-x-1/2"
        >
          <div className="overflow-hidden flex-auto w-screen max-w-max text-sm leading-6 bg-white rounded-3xl ring-1 shadow-lg ring-gray-600/5">
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
