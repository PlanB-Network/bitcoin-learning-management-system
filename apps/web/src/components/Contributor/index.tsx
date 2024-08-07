import { useTranslation } from 'react-i18next';

import { Avatar } from '@blms/ui';

import grayHeart from '../../assets/icons/gray_heart.svg';

interface ContributorProps {
  prefix?: string;
  contributor: {
    image?: string;
    username: string;
    title?: string;
  };
}

export const Contributor = ({ prefix, contributor }: ContributorProps) => {
  const { t } = useTranslation();
  return (
    <div>
      {prefix && (
        <div className="mb-1 flex text-sm font-light italic text-gray-500">
          {prefix}
          <img
            className="ml-1"
            src={grayHeart}
            alt={t('imagesAlt.contributorHeart')}
          />
        </div>
      )}
      <div className="float-right flex flex-row rounded-l-3xl rounded-r-lg border-2 bg-white">
        {contributor?.image && (
          <Avatar
            rounded
            size="xs"
            alt={t('imagesAlt.contributorPP')}
            image={contributor.image}
          />
        )}
        <div className="ml-2 flex flex-col justify-center">
          <span className="mr-2 text-sm leading-tight">
            {contributor.username}
          </span>
        </div>
      </div>
    </div>
  );
};
