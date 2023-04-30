import { FiChevronDown } from 'react-icons/fi';

import { useDisclosure } from '../../../../hooks';
import { compose } from '../../../../utils';
import { MenuElement } from '../../MenuElement';
import { NavigationSubSection } from '../../props';

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
        className="flex flex-row justify-between px-4 py-3 my-1 w-full text-left text-gray-500 rounded-md border border-gray-200 border-solid duration-300"
      >
        <span>{subSection.title}</span>
        <FiChevronDown
          className={compose(
            'p-0 m-0 w-6 h-6 duration-300',
            isOpen ? 'rotate-180' : 'rotate-0'
          )}
        />
      </button>
      <div className={compose('overflow-hidden', isOpen ? 'h-max' : 'h-0')}>
        {'items' in subSection &&
          subSection.items.map((element, index) => (
            <ul
              key={`${subSection.id}-${index}`}
              className="overflow-auto flex-1 pl-0 my-0 list-none"
            >
              <li className="pl-0 my-1 ml-0 list-none" key={element.id}>
                <MenuElement element={element} />
              </li>
            </ul>
          ))}
      </div>
    </div>
  );
};
