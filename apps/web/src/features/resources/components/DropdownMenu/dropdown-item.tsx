import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CategoryIcon } from '#src/components/CategoryIcon/index.js';
import { capitalizeFirstWord } from '#src/utils/string.js';

interface ResourcesDropdownItemProps {
  name: 'books' | 'podcasts' | 'builders' | 'conferences' | 'bet';
  imageSrc: string;
}

export const ResourcesDropdownItem = ({
  name,
  imageSrc,
}: ResourcesDropdownItemProps) => {
  const { t } = useTranslation();

  return (
    <Link
      key={name}
      to={`/resources/${name}`}
      className="group flex items-center gap-4 p-2 hover:bg-white/10"
    >
      <CategoryIcon
        src={imageSrc}
        variant="resources"
        imgClassName="group-hover:filter-newOrange1 filter-white size-6"
      />
      <span className="text-white group-hover:text-newOrange-1 leading-[140%] tracking-[0.15px]">
        {capitalizeFirstWord(t(`resources.${name}.title`))}
      </span>
    </Link>
  );
};
