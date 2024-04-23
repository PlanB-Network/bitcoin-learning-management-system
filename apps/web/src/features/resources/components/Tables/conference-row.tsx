import { Link } from '@tanstack/react-router';
import { t } from 'i18next';

import { Button } from '@sovereign-university/ui';

import Flag from '#src/atoms/Flag/index.js';

interface ConferenceRowProps {
  name: string;
  location: string;
  tags: string[];
  languages: string[];
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
      <td className="desktop-h5 py-5">{name}</td>
      <td className="desktop-h8 py-5 text-newGray-1">{location}</td>
      <td className="py-5 flex gap-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-newGray-4 font-medium leading-normal px-2.5 py-1.5 border border-newGray-1 bg-newBlack-3 rounded-md"
          >
            {tag}
          </span>
        ))}
      </td>
      <td className="py-5">
        <div className="flex gap-10 justify-center">
          <div className="flex gap-2.5 ml-auto">
            {languages.map((language) => (
              <span
                key={language}
                className="flex justify-center items-center p-2 bg-newBlack-3 rounded-md"
              >
                <Flag code={language} size="l" />
              </span>
            ))}
          </div>
          {link ? (
            <Link to={link} className="ml-auto">
              <Button variant="newPrimary">
                {t('events.card.watchReplay')}
              </Button>
            </Link>
          ) : (
            <Button variant="newPrimary" disabled className="ml-auto">
              {t('events.card.watchReplay')}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};
