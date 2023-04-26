import { FiChevronDown } from 'react-icons/fi';

import { useDisclosure } from '../../../../hooks';
import { NavigationSubSection } from '../../props';
import { arrowIcon, listContainer, listElement } from '../index.css';
import { MobileMenuElement } from '../MobileMenuElement';

import {
  menuSubSectionButton,
  menuSubSectionListItemsContent,
} from './index.css';

export interface MobileMenuSubSectionProps {
  subSection: NavigationSubSection;
}

export const MobileMenuSubSection = ({
  subSection,
}: MobileMenuSubSectionProps) => {
  const { toggle, isOpen } = useDisclosure();

  return (
    <div key={subSection.id}>
      <button onClick={toggle} className={menuSubSectionButton}>
        <span>{subSection.title}</span>
        <FiChevronDown
          className={arrowIcon}
          style={{ transform: isOpen ? 'rotateZ(180deg)' : 'rotateZ(0)' }}
        />
      </button>
      <div
        className={menuSubSectionListItemsContent}
        style={{ maxHeight: isOpen ? '300vh' : '0vh' }}
      >
        {'items' in subSection &&
          subSection.items.map((col, index) => (
            <ul key={`${subSection.id}-${index}`} className={listContainer}>
              {col.map((element) => (
                <li className={listElement} key={element.id}>
                  <MobileMenuElement element={element} />
                </li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  );
};
