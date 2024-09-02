import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { FaArrowRightLong } from 'react-icons/fa6';

import { Button, Tag, cn } from '@blms/ui';

import Flag from '#src/molecules/Flag/index.js';

interface ConferenceRowProps {
  name: string;
  location: string;
  tags: string[];
  languages: string[] | null;
  link?: string;
}

export const ConferenceRow = ({
  name,
  location,
  tags,
  languages,
  link,
}: ConferenceRowProps) => {
  return (
    <tr>
      <td className="desktop-h5 py-5 pr-4 capitalize">{name}</td>
      <td className="desktop-h8 py-5 pr-4 text-newGray-1">{location}</td>
      <td className="py-5 pr-4">
        <div className="flex gap-4 flex-wrap items-center">
          {tags.map((tag) => (
            <Tag key={tag} className="capitalize">
              {tag}
            </Tag>
          ))}
        </div>
      </td>
      <td className="py-5">
        <div className="flex justify-center items-center mx-auto flex-wrap gap-2.5">
          {languages?.slice(0, 2).map((language) => (
            <span
              key={language}
              className="flex justify-center items-center p-2 bg-newBlack-3 rounded-md h-fit"
            >
              <Flag code={language} size="l" />
            </span>
          ))}
        </div>
      </td>
      <td className="py-5">
        <div className="flex justify-center items-center">
          {link ? (
            <Link to={link} className="min-w-fit">
              <Button variant="primary">
                {t('events.card.watchReplay')}
                <FaArrowRightLong
                  className={cn(
                    'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                    'group-hover:ml-3',
                  )}
                />
              </Button>
            </Link>
          ) : (
            <Button variant="primary" disabled className="min-w-fit">
              {t('events.card.watchReplay')}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};
