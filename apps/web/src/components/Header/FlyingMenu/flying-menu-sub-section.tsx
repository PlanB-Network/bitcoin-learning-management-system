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
    <div className="m-5">
      {subSection.title && (
        <h3
          className={compose(
            'text-lg font-primary font-semibold',
            'items' in subSection ? 'mb-4 px-2' : '',
            variant === 'light' ? 'text-darkOrange-10' : 'text-white',
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
