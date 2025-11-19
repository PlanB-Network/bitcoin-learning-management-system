import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CategoryIcon } from '#src/components/category-icon.js';
import { capitalizeFirstWord } from '#src/utils/string.js';

interface ResourcesDropdownItemProps {
  name:
    | 'bet'
    | 'books'
    | 'channels'
    | 'conferences'
    | 'glossary'
    | 'lectures'
    | 'movies'
    | 'newsletters'
    | 'podcasts'
    | 'projects';
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
      className="flex items-center gap-4 p-2"
    >
      <CategoryIcon
        src={imageSrc}
        variant="resources"
        imgClassName="filter-white size-6"
      />
      <span className="text-white leading-[140%] tracking-015px">
        {capitalizeFirstWord(t(`resources.${name}.title`))}
      </span>
    </Link>
  );
};
