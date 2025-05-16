import { compose } from '../../../utils/index.ts';
import { MenuElement } from '../menu-elements.tsx';
import type { NavigationSubSection } from '../props.ts';

export interface FlyingMenuSubSectionProps {
  subSection: NavigationSubSection;
  variant?: 'dark' | 'light';
  hasMultipleSubSection?: boolean;
}

export const FlyingMenuSubSection = ({
  subSection,
  variant = 'dark',
  hasMultipleSubSection,
}: FlyingMenuSubSectionProps) => {
  return (
    <div className="flex flex-col my-2 mx-2.5 gap-2.5">
      {subSection.title && (
        <h3
          className={compose(
            'text-lg font-primary font-semibold',
            'items' in subSection ? 'mb-4 px-2' : '',
            variant === 'light' ? 'text-black' : 'text-white',
          )}
        >
          {subSection.title}
        </h3>
      )}
      {'items' in subSection &&
        subSection.items.map((item) => (
          <MenuElement
            key={item.id}
            element={item}
            variant={variant}
            isMultipleSubSectionChildren={hasMultipleSubSection}
          />
        ))}
    </div>
  );
};
