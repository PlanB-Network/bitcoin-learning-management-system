import { NavigationSection } from '../props';

import { FlyingMenuSection } from './FlyingMenuSection';

export interface FlyingMenuProps {
  sections: NavigationSection[];
}

export const FlyingMenu = ({ sections }: FlyingMenuProps) => {
  return (
    <nav>
      <ul className="flex flex-row space-x-10 text-white">
        {sections.map((section, index) => (
          <li className="font-primary" key={section.id}>
            <FlyingMenuSection section={section} />
          </li>
        ))}
      </ul>
    </nav>
  );
};
