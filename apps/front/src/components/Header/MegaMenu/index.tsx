import { listContainer, navContainer } from './index.css';
import { MegaMenuSection } from './MegaMenuSection';
import { MegaMenuSection as IMegaMenuSection } from './props';

export interface HeaderProps {
  isExpanded: boolean;
}

export interface MegaMenuProps {
  sections: IMegaMenuSection[];
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
