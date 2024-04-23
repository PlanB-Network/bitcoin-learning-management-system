import { t } from 'i18next';

import { ConferenceRow } from './conference-row.tsx';

export const ConferencesTable = () => {
  return (
    <div className="overflow-x-auto text-white max-md:hidden mt-16">
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th scope="col" className="desktop-h7 pb-5">
              {t('conferences.conferenceName')}
            </th>
            <th scope="col" className="desktop-h7 pb-5">
              {t('conferences.location')}
            </th>
            <th scope="col" className="desktop-h7 pb-5">
              {t('conferences.topics')}
            </th>
            <th scope="col" className="desktop-h7 pb-5">
              {t('conferences.language')}
            </th>
          </tr>
        </thead>

        <tbody>
          <ConferenceRow
            name="Adopting Bitcoin 2018"
            location="City very long, Country"
            tags={['Tag 1', 'Lightning']}
            languages={['EN', 'FR']}
            link="/"
          />
          <ConferenceRow
            name="Madeira Bitcoin 2019"
            location="City very long, Country"
            tags={['Tag 5', 'Lightning', 'Lightning', 'Lightning']}
            languages={['EN']}
          />
        </tbody>
      </table>
    </div>
  );
};
