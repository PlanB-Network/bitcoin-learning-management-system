import { cn } from '@blms/ui';
import { MenuElement } from '../menu-elements.tsx';
import type { NavigationSubSection } from '../props.ts';

export interface FlyingMenuSubSectionProps {
  subSection: NavigationSubSection;
  variant?: 'dark' | 'light';
  hasMultipleSubSection?: boolean;
  rtl?: boolean;
}

export const FlyingMenuSubSection = ({
  subSection,
  variant = 'dark',
  hasMultipleSubSection,
  rtl,
}: FlyingMenuSubSectionProps) => {
  return (
    <div className={cn('flex flex-col my-2 mx-2.5 gap-2.5', rtl && 'mx-0')}>
      {subSection.title && (
        <h3
          className={cn(
            'text-lg font-primary font-semibold',
            'items' in subSection ? 'mb-4 px-2' : '',
            variant === 'light' ? 'text-black' : 'text-white',
            rtl && 'text-right',
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
            rtl={rtl}
          />
        ))}
    </div>
  );
};
