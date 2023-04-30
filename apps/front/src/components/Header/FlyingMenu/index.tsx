import { NavigationSection } from '../props';

import { FlyingMenuSection } from './FlyingMenuSection';

export interface FlyingMenuProps {
  sections: NavigationSection[];
}

export const FlyingMenu = ({ sections }: FlyingMenuProps) => {
  return (
    <nav>
      <ul className="flex flex-row mt-4 text-white">
        {sections.map((section, index) => (
          <li className="mx-4 font-primary" key={section.id}>
            <FlyingMenuSection section={section} />
          </li>
        ))}
      </ul>
    </nav>
  );
};
