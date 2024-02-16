import { FiChevronDown } from 'react-icons/fi';

import { useDisclosure } from '../../../../hooks/use-disclosure.ts';
import { compose } from '../../../../utils/index.ts';
import { MenuElement } from '../../MenuElement/index.tsx';
import type { NavigationSubSection } from '../../props.tsx';

export interface MobileMenuSubSectionProps {
  subSection: NavigationSubSection;
}

export const MobileMenuSubSection = ({
  subSection,
}: MobileMenuSubSectionProps) => {
  const { toggle, isOpen } = useDisclosure();

  return (
    <div className="pl-5" key={subSection.id}>
      <button
        onClick={toggle}
        className="my-1 flex w-full flex-row justify-between rounded-md border border-solid border-gray-200 px-4 py-3 text-left text-gray-500 duration-300"
      >
        <span>{subSection.title}</span>
        <FiChevronDown
          className={compose(
            'p-0 m-0 w-6 h-6 duration-300',
            isOpen ? 'rotate-180' : 'rotate-0',
          )}
        />
      </button>
      <div className={compose('overflow-hidden', isOpen ? 'h-max' : 'h-0')}>
        {'items' in subSection &&
          subSection.items.map((element, index) => (
            <ul
              key={`${subSection.id}-${index}`}
              className="my-0 flex-1 list-none overflow-auto pl-0"
            >
              <li className="my-1 ml-0 list-none pl-0" key={element.id}>
                <MenuElement element={element} />
              </li>
            </ul>
          ))}
      </div>
    </div>
  );
};
