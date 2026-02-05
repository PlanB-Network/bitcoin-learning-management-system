import { formatNameForURL } from '@blms/shared';
import type { JoinedConference } from '@blms/types';
import { useTranslation } from 'react-i18next';

import { ConferenceRow } from './conference-row.tsx';

interface ConferencesTableProps {
  conferences: JoinedConference[];
}

export const ConferencesTable = ({ conferences }: ConferencesTableProps) => {
  const { t } = useTranslation();
  return (
    <div className="overflow-x-auto text-black max-xl:hidden mt-8">
      <table className="min-w-full text-left table-fixed">
        <thead>
          <tr>
            <th scope="col" className="subtitle-base pb-5 pr-4 w-64">
              {t('conferences.conferenceName')}
            </th>
            <th scope="col" className="subtitle-base pb-5 pr-4 w-50">
              {t('conferences.location')}
            </th>
            <th scope="col" className="subtitle-base pb-5 pr-4">
              {t('conferences.topics')}
            </th>
            <th scope="col" className="subtitle-base pb-5 w-28">
              {t('conferences.language')}
            </th>
            <th scope="col" className="subtitle-base pb-5 w-46" />
          </tr>
        </thead>

        <tbody className="align-top">
          {conferences.map((conference) => {
            return (
              <ConferenceRow
                key={conference.id}
                name={conference.name}
                location={conference.location}
                tags={conference.tags}
                languages={conference.languages}
                link={
                  conference.stages.length > 0
                    ? `/resources/conferences/${formatNameForURL(conference.name)}-${conference.id}`
                    : ''
                }
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
