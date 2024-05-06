import { t } from 'i18next';

import type { JoinedConference } from '@sovereign-university/types';

import { ConferenceRow } from './conference-row.tsx';

interface ConferencesTableProps {
  conferences: JoinedConference[];
}

export const ConferencesTable = ({ conferences }: ConferencesTableProps) => {
  return (
    <div className="overflow-x-auto text-white max-lg:hidden mt-16">
      <table className="min-w-full text-left table-fixed">
        <thead>
          <tr>
            <th scope="col" className="desktop-h7 pb-5 pr-4 w-80">
              {t('conferences.conferenceName')}
            </th>
            <th scope="col" className="desktop-h7 pb-5 pr-4 w-52">
              {t('conferences.location')}
            </th>
            <th scope="col" className="desktop-h7 pb-5 pr-4">
              {t('conferences.topics')}
            </th>
            <th scope="col" className="desktop-h7 pb-5 pl-8 w-80">
              {t('conferences.language')}
            </th>
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
                    ? `/resources/conference/${conference.id}`
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
