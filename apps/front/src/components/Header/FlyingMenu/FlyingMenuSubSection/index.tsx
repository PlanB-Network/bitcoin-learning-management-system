import { compose } from '../../../../utils';
import { MenuElement } from '../../MenuElement';
import { NavigationSubSection } from '../../props';

export interface FlyingMenuSubSectionProps {
  subSection: NavigationSubSection;
}

export const FlyingMenuSubSection = ({
  subSection,
}: FlyingMenuSubSectionProps) => {
  return (
    <div className="m-6">
      <h3
        className={compose(
          'text-lg text-primary-800 font-primary',
          'items' in subSection ? 'mb-3' : ''
        )}
      >
        {subSection.title}
      </h3>
      {'items' in subSection &&
        subSection.items.map((item) => (
          <MenuElement key={item.id} element={item} />
        ))}
    </div>
  );
};
