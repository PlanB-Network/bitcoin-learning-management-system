import { compose } from '../../../../utils/index.ts';
import { MenuElement } from '../../MenuElement/index.tsx';
import type { NavigationSubSection } from '../../props.tsx';

export interface FlyingMenuSubSectionProps {
  subSection: NavigationSubSection;
}

export const FlyingMenuSubSection = ({
  subSection,
}: FlyingMenuSubSectionProps) => {
  return (
    <div className="m-6">
      {subSection.title && (
        <h3
          className={compose(
            'text-lg text-blue-800 font-primary font-semibold',
            'items' in subSection ? 'mb-3' : '',
          )}
        >
          {subSection.title}
        </h3>
      )}
      {'items' in subSection &&
        subSection.items.map((item) => (
          <MenuElement key={item.id} element={item} />
        ))}
    </div>
  );
};
