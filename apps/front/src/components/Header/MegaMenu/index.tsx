import { NavigationSection } from '../props';

import { listContainer, navContainer } from './index.css';
import { MegaMenuSection } from './MegaMenuSection';

export interface MegaMenuProps {
  sections: NavigationSection[];
}

export const MegaMenu = ({ sections }: MegaMenuProps) => {
  return (
    <nav className={navContainer}>
      <ul className={listContainer}>
        {sections.map((section) => (
          <MegaMenuSection section={section} key={section.id} />
        ))}
      </ul>
    </nav>
  );
};
