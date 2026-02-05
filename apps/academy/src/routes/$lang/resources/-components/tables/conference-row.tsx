import { Button, Flag, TextTag } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <tr className="border-t border-neutral-100">
      <td className="body-large py-5 pr-2.5 capitalize">{name}</td>
      <td className="body-base py-5 pr-2.5 text-neutral-500">{location}</td>
      <td className="py-5 pr-2.5">
        <div className="flex gap-2 flex-wrap items-center">
          {tags.map((tag) => (
            <TextTag mode="light" className="capitalize" size="base" key={tag}>
              {tag}
            </TextTag>
          ))}
        </div>
      </td>
      <td className="py-5">
        <div className="flex items-center flex-wrap gap-2">
          {languages?.slice(0, 2).map((language) => (
            <Flag key={language} code={language} size="l" />
          ))}
        </div>
      </td>
      <td className="py-5">
        <div className="flex justify-end items-center">
          {link ? (
            <Button variant="primary" asChild>
              <Link to={link}>{t('events.card.watchReplay')}</Link>
            </Button>
          ) : (
            <Button variant="primary" disabled>
              {t('events.card.watchReplay')}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};
