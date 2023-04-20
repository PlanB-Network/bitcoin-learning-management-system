import {
  megaMenuColumn,
  megaMenuColumns,
  megaMenuItem,
  megaMenuTitle,
} from '../index.css';
import { MegaMenuElement } from '../MegaMenuElement';
import { MegaMenuSubSection as IMegaMenuSubSection } from '../props';

export interface MegaMenuSubSectionProps {
  subSection: IMegaMenuSubSection;
}

export const MegaMenuSubSection = ({ subSection }: MegaMenuSubSectionProps) => {
  return (
    <div key={subSection.id} className={megaMenuItem}>
      <h3 className={megaMenuTitle}>{subSection.title}</h3>
      <div className={megaMenuColumns}>
        {subSection.items.map((col, index) => (
          <ul key={`${subSection.id}-${index}`} className={megaMenuColumn}>
            {col.map((element) => (
              <li key={element.id}>
                <MegaMenuElement element={element} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
};
