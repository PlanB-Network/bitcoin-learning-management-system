import { useMemo } from 'react';

import { NavigationSection } from '../../props';
import {
  firstLevelListItem,
  listElementTitle,
  megaMenu,
  megaMenuColumn,
  megaMenuContainer,
} from '../index.css';
import { MegaMenuElement } from '../MegaMenuElement';
import { MegaMenuSubSection } from '../MegaMenuSubSection';

export interface MegaMenuSectionProps {
  section: NavigationSection;
}

export const MegaMenuSection = ({ section }: MegaMenuSectionProps) => {
  const sectionTitle = useMemo(() => {
    if ('path' in section)
      return (
        <a className={listElementTitle} href={section.path}>
          {section.title}
        </a>
      );
    if ('action' in section)
      return (
        <button
          className={listElementTitle}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            section.action();
          }}
        >
          {section.title}
        </button>
      );
    return <button className={listElementTitle}>{section.title}</button>;
  }, [section]);

  return (
    <li key={section.id} className={firstLevelListItem}>
      {sectionTitle}
      {'items' in section && section.items.length && (
        <div className={megaMenu}>
          <div className={megaMenuContainer}>
            {section.items.map((subSectionOrElements, index) =>
              Array.isArray(subSectionOrElements) ? (
                <ul key={`${section.id}-${index}`} className={megaMenuColumn}>
                  {subSectionOrElements.map((element) => (
                    <li key={element.id}>
                      <MegaMenuElement element={element} />
                    </li>
                  ))}
                </ul>
              ) : (
                <MegaMenuSubSection
                  key={subSectionOrElements.id}
                  subSection={subSectionOrElements}
                />
              )
            )}
          </div>
        </div>
      )}
    </li>
  );
};
