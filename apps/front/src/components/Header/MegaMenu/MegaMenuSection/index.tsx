import {
  firstLevelListItem,
  listElementTitle,
  megaMenu,
  megaMenuColumn,
  megaMenuContainer,
} from '../index.css';
import { MegaMenuElement } from '../MegaMenuElement';
import { MegaMenuSubSection } from '../MegaMenuSubSection';
import { MegaMenuSection as IMegaMenuSection } from '../props';

export interface HeaderProps {
  isExpanded: boolean;
}

export interface MegaMenuSectionProps {
  section: IMegaMenuSection;
}

export const MegaMenuSection = ({ section }: MegaMenuSectionProps) => {
  return (
    <li key={section.id} className={firstLevelListItem}>
      {section.path ? (
        <a className={listElementTitle} href={section.path}>
          {section.title}
        </a>
      ) : (
        <button
          className={listElementTitle}
          onClick={() => {
            section.action?.();
          }}
          style={{ cursor: section.action ? 'pointer' : 'initial' }}
        >
          {section.title}
        </button>
      )}
      {section.items?.length && (
        <div className={megaMenu}>
          <div className={megaMenuContainer}>
            {section.items.map((subSectionOrElements, index) =>
              'items' in subSectionOrElements ? (
                <MegaMenuSubSection
                  key={subSectionOrElements.id}
                  subSection={subSectionOrElements}
                />
              ) : (
                <ul key={`${section.id}-${index}`} className={megaMenuColumn}>
                  {subSectionOrElements.map((element) => (
                    <li key={element.id}>
                      <MegaMenuElement element={element} />
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        </div>
      )}
    </li>
  );
};
