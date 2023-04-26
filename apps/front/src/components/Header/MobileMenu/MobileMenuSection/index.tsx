import { useMemo } from 'react';
import { FiChevronDown } from 'react-icons/fi';

import { useDisclosure } from '../../../../hooks';
import { NavigationSection } from '../../props';
import { arrowIcon, listContainer, listElement } from '../index.css';
import { MobileMenuElement } from '../MobileMenuElement';
import { MobileMenuSubSection } from '../MobileMenuSubSection';

import {
  menuSectionButton,
  menuSectionListItem,
  menuSectionListItemsContent,
} from './index.css';

export interface MegaMenuSectionProps {
  section: NavigationSection;
}

export const MobileMenuSection = ({ section }: MegaMenuSectionProps) => {
  const { toggle, isOpen } = useDisclosure();
  const sectionTitle = useMemo(() => {
    if ('path' in section) return <a href={section.path}>{section.title}</a>;
    if ('action' in section)
      return (
        <button
          className={menuSectionButton}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            section.action();
          }}
        >
          <span>{section.title}</span>
          <FiChevronDown
            className={arrowIcon}
            style={{ transform: isOpen ? 'rotateZ(180deg)' : 'rotateZ(0)' }}
          />
        </button>
      );
    return (
      <button className={menuSectionButton} onClick={() => toggle()}>
        <span>{section.title}</span>
        <FiChevronDown
          className={arrowIcon}
          style={{ transform: isOpen ? 'rotateZ(180deg)' : 'rotateZ(0)' }}
        />
      </button>
    );
  }, [isOpen, section, toggle]);

  return (
    <li key={section.id} className={menuSectionListItem}>
      {sectionTitle}
      {'items' in section && (
        <div
          className={menuSectionListItemsContent}
          style={{ maxHeight: isOpen ? '300vh' : '0vh' }}
        >
          {section?.items?.map((subSectionOrElements, index) =>
            Array.isArray(subSectionOrElements) ? (
              <ul key={`${section.id}-${index}`} className={listContainer}>
                {subSectionOrElements.map((element) => (
                  <li className={listElement} key={element.id}>
                    <MobileMenuElement element={element} />
                  </li>
                ))}
              </ul>
            ) : (
              <MobileMenuSubSection
                key={subSectionOrElements.id}
                subSection={subSectionOrElements}
              />
            )
          )}
        </div>
      )}
    </li>
  );
};
