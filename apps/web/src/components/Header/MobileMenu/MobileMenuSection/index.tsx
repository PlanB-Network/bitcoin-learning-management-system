import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { FiChevronDown } from 'react-icons/fi';

import { useDisclosure } from '../../../../hooks/use-disclosure.ts';
import { compose } from '../../../../utils/index.ts';
import { MenuElement } from '../../MenuElement/index.tsx';
import type { NavigationSection } from '../../props.tsx';
import { MobileMenuSubSection } from '../MobileMenuSubSection/index.tsx';

export interface MobileMenuSectionProps {
  section: NavigationSection;
}

const buttonClasses =
  'flex flex-row justify-between py-3 px-4 my-2 w-full text-left text-gray-500 rounded-md border border-gray-200 border-solid duration-500 cursor-pointer';

export const MobileMenuSection = ({ section }: MobileMenuSectionProps) => {
  const { toggle, isOpen } = useDisclosure();
  const currentSection = '/'.concat(
    window.location.pathname.split('/').slice(0, 2).join(''),
  );

  const sectionTitle = useMemo(() => {
    if ('path' in section) {
      let fontWeight =
        currentSection &&
        currentSection !== '/' &&
        section.path.includes(currentSection)
          ? 'font-semibold'
          : 'font-light';

      if (section.path === '/' && currentSection === '/') {
        fontWeight = 'font-semibold';
      }

      return (
        <Link
          className={compose(
            'text-2xl font-light uppercase text-white no-underline',
            fontWeight,
          )}
          /* TODO: fix */
          to={section.path as '/'}
        >
          {section.title}
        </Link>
      );
    }
    if ('action' in section)
      return (
        <button
          className={buttonClasses}
          onClick={() => {
            section.action();
          }}
        >
          <span>{section.title}</span>
        </button>
      );

    return (
      <button className={buttonClasses} onClick={() => toggle()}>
        <span>{section.title}</span>
        <FiChevronDown
          className={compose(
            'p-0 m-0 w-6 h-6 duration-300',
            isOpen ? 'rotate-180' : 'rotate-0',
          )}
        />
      </button>
    );
  }, [isOpen, section, currentSection, toggle]);

  return (
    <li key={section.id} className="h-max overflow-hidden">
      {sectionTitle}
      {'items' in section && (
        <div className={compose('overflow-hidden', isOpen ? 'h-max' : 'h-0')}>
          {section?.items?.map((subSectionOrElements, index) =>
            Array.isArray(subSectionOrElements) ? (
              <ul
                key={`${section.id}-${index}`}
                className="my-0 flex-1 list-none overflow-auto pl-0"
              >
                {subSectionOrElements.map((element) => (
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                  <li className="my-1 ml-0 list-none pl-0" key={element.id}>
                    {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                      <MenuElement key={element.id} element={element} />
                    }
                  </li>
                ))}
              </ul>
            ) : (
              <MobileMenuSubSection
                key={subSectionOrElements.id}
                subSection={subSectionOrElements}
              />
            ),
          )}
        </div>
      )}
    </li>
  );
};
