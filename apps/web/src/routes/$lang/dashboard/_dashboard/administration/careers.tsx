import type { JoinedCareerProfile } from '@blms/types';
import { Button, cn, Loader, TextTag } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { HiOutlineDownload } from 'react-icons/hi';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { TbArrowsSort } from 'react-icons/tb';
import XLSX from 'xlsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/careers',
)({
  component: AdminCareers,
});

function AdminCareers() {
  const [sortedCareerProfiles, setSortedCareerProfiles] = useState<
    JoinedCareerProfile[] | []
  >([]);
  const [sortBy, setSortBy] = useState<'name' | 'lastUpdate'>('lastUpdate');
  const [sortingOrder, setSortingOrder] = useState<'asc' | 'desc'>('desc');
  const [maxShownProfiles, setMaxShownProfiles] = useState(10);

  const { data: careerProfiles, isFetched: isCareerProfilesFetched } = useQuery(
    trpc.user.career.getCareerProfiles.queryOptions(),
  );

  const { data: languages, isFetched: isLanguagesFetched } = useQuery(
    trpc.user.career.getLanguages.queryOptions(),
  );
  const { data: jobTitles, isFetched: isJobTitlesFetched } = useQuery(
    trpc.user.career.getJobTitles.queryOptions(),
  );

  useEffect(() => {
    if (careerProfiles) {
      sortCareerProfiles(careerProfiles, sortBy, sortingOrder);
    }
  }, [careerProfiles, sortBy, sortingOrder]);

  const sortCareerProfiles = (
    profiles: JoinedCareerProfile[],
    sortBy: 'name' | 'lastUpdate',
    sortingOrder: 'asc' | 'desc',
  ) => {
    const sortedProfiles = [...profiles].sort((a, b) => {
      if (sortBy === 'name') {
        return sortingOrder === 'asc'
          ? (a.firstName ?? '').localeCompare(b.firstName ?? '')
          : (b.firstName ?? '').localeCompare(a.firstName ?? '');
      }

      return sortingOrder === 'asc'
        ? new Date(a.editedAt).getTime() - new Date(b.editedAt).getTime()
        : new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime();
    });

    setSortedCareerProfiles(sortedProfiles);
  };

  const downloadCareerProfiles = (profiles: JoinedCareerProfile[]) => {
    if (!profiles || profiles.length === 0) return;

    const data = profiles.map((profile) => {
      const languagesText = profile.languages
        .map((lang) => {
          const language = languages?.find((l) => l.code === lang.languageCode);
          return `${language?.name || lang.languageCode} (${lang.level})`;
        })
        .join('\n');

      const rolesText = profile.roles
        .map((role) => {
          const jobTitle = jobTitles?.find((jt) => jt.id === role.roleId);
          return `${
            jobTitle
              ? t(`dashboard.careerPortal.jobTitles.${jobTitle.name}`)
              : role.roleId
          } (${role.level})`;
        })
        .join('\n');

      const companySizesText = profile.companySizes
        .map((size) => t(`dashboard.careerPortal.companySizes.${size}`))
        .join('\n');

      return {
        'Availability Start': profile.availabilityStart,
        'Bitcoin Community': profile.isBitcoinCommunityParticipant
          ? 'yes'
          : 'no',
        'Bitcoin Community Text': profile.bitcoinCommunityText,
        'Bitcoin Projects': profile.isBitcoinProjectParticipant ? 'yes' : 'no',
        'Bitcoin Projects Text': profile.bitcoinProjectText,
        'Company Sizes': companySizesText,
        Country: profile.country,
        'Created At': profile.createdAt,
        'CV URL': `https://planb.network${profile.cvUrl}`,
        'Edited At': profile.editedAt,
        Email: profile.email,
        'Expected Salary': profile.expectedSalary,
        'First Name': profile.firstName,
        'Full-Time Available': profile.isAvailableFullTime ? 'yes' : 'no',
        GitHub: profile.github || 'N/A',
        Languages: languagesText,
        'Last Name': profile.lastName,
        LinkedIn: profile.linkedin || 'N/A',
        'Motivation Letter': profile.motivationLetter,
        'Other Contact': profile.otherContact || 'N/A',
        'Remote Work Preference': profile.remoteWorkPreference,
        Roles: rolesText,
        Telegram: profile.telegram || 'N/A',
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // First Name
      { wch: 12 }, // Last Name
      { wch: 12 }, // Country
      { wch: 20 }, // Email
      { wch: 15 }, // LinkedIn
      { wch: 15 }, // GitHub
      { wch: 15 }, // Telegram
      { wch: 15 }, // Other Contact
      { wch: 30 }, // Languages
      { wch: 10 }, // Bitcoin Community
      { wch: 30 }, // Bitcoin Community Text
      { wch: 10 }, // Bitcoin Projects
      { wch: 30 }, // Bitcoin Projects Text
      { wch: 30 }, // Roles
      { wch: 25 }, // Company Sizes
      { wch: 10 }, // Full-Time Available
      { wch: 20 }, // Remote Work Preference
      { wch: 15 }, // Expected Salary
      { wch: 15 }, // Availability Start
      { wch: 40 }, // CV URL
      { wch: 50 }, // Motivation Letter
      { wch: 15 }, // Created At
      { wch: 15 }, // Edited At
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Career Profiles');

    XLSX.writeFile(wb, 'Career_Profiles.xlsx');
  };

  const isMobile = useSmaller('md');

  const tableHeaderClasses =
    'text-dashboardSectionTitle leading-normal !font-medium tracking-015px';

  return (
    <>
      <div className="flex gap-2.5 md:gap-5 mb-5">
        <h1 className="title-large-24px md:display-small-32px text-dashboardSectionText">
          {t('words.careerPortal')}
        </h1>
        <TextTag
          size={isMobile ? 'verySmall' : 'small'}
          mode="light"
          variant="grey"
          className="uppercase"
        >
          {t('words.admin')}
        </TextTag>
      </div>
      <h2 className="title-medium-sb-18px md:title-large-sb-24px text-dashboardSectionTitle mb-2.5 md:mb-[15px]">
        {t('dashboard.adminPanel.careers.careers')}
      </h2>
      <p className="text-dashboardSectionText/75 md:text-newBlack-1 body-16px mb-8 max-w-[994px]">
        {t('dashboard.adminPanel.careers.careersSubtitle')}
      </p>

      {(!isCareerProfilesFetched ||
        !isLanguagesFetched ||
        !isJobTitlesFetched) && <Loader />}

      {isCareerProfilesFetched &&
        isLanguagesFetched &&
        isJobTitlesFetched &&
        sortedCareerProfiles.length > 0 && (
          <>
            <div className="flex md:items-center max-md:flex-col gap-1.5 md:gap-7 mb-7">
              <Button
                variant="primary"
                size="m"
                className="w-fit"
                onClick={() => {
                  downloadCareerProfiles(careerProfiles || []);
                }}
              >
                {t('dashboard.adminPanel.careers.downloadSpreadsheet')}
                <HiOutlineDownload className="ml-2" size={24} />
              </Button>
              <span className="body-14px md:subtitle-medium-16px text-newBlack-2">
                {t('dashboard.adminPanel.careers.lastUpdated')}:{' '}
                <span className="text-newGray-1">
                  {sortedCareerProfiles?.length > 0
                    ? new Date(
                        Math.max(
                          ...sortedCareerProfiles.map((profile) =>
                            new Date(profile.editedAt).getTime(),
                          ),
                        ),
                      ).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </span>
            </div>

            <table className="max-md:hidden w-full max-w-[1012px] table-auto border-collapse">
              <thead>
                <tr>
                  <th
                    className={cn(
                      'border-b pr-4 py-3.5 text-start',
                      tableHeaderClasses,
                    )}
                  >
                    <button
                      className="text-start flex items-center gap-3.5"
                      onClick={() => {
                        if (sortBy === 'name') {
                          setSortingOrder(
                            sortingOrder === 'asc' ? 'desc' : 'asc',
                          );
                        } else {
                          setSortingOrder('desc');
                          setSortBy('name');
                        }
                      }}
                      tabIndex={0}
                      type="button"
                    >
                      <span>{t('words.name')}</span>
                      {sortBy === 'name' ? (
                        <MdKeyboardArrowDown
                          className={`shrink-0 transition-all ${
                            sortingOrder === 'asc' ? '-rotate-180' : 'rotate-0'
                          }`}
                          size={24}
                        />
                      ) : (
                        <TbArrowsSort className="shrink-0" size={24} />
                      )}
                    </button>
                  </th>
                  <th
                    className={cn(
                      'border-b pr-4 py-3.5 text-start',
                      tableHeaderClasses,
                    )}
                  >
                    {t('dashboard.adminPanel.careers.profession')}
                  </th>
                  <th
                    className={cn(
                      'border-b pr-4 py-3.5 text-start',
                      tableHeaderClasses,
                    )}
                  >
                    <button
                      className="text-start flex items-center gap-3.5"
                      onClick={() => {
                        if (sortBy === 'lastUpdate') {
                          setSortingOrder(
                            sortingOrder === 'asc' ? 'desc' : 'asc',
                          );
                        } else {
                          setSortingOrder('desc');
                          setSortBy('lastUpdate');
                        }
                      }}
                      tabIndex={0}
                      type="button"
                    >
                      <span>
                        {t('dashboard.adminPanel.careers.lastUpdate')}
                      </span>
                      {sortBy === 'lastUpdate' ? (
                        <MdKeyboardArrowDown
                          className={`shrink-0 transition-all ${
                            sortingOrder === 'asc' ? '-rotate-180' : 'rotate-0'
                          }`}
                          size={24}
                        />
                      ) : (
                        <TbArrowsSort className="shrink-0" size={24} />
                      )}
                    </button>
                  </th>
                  <th
                    className={cn(
                      'border-b pr-4 py-3.5 text-start',
                      tableHeaderClasses,
                    )}
                  >
                    {t('dashboard.adminPanel.careers.cv')}
                  </th>
                  <th
                    className={cn(
                      'border-b py-3.5 text-start',
                      tableHeaderClasses,
                    )}
                  >
                    {t('auth.emailAddress')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCareerProfiles
                  .slice(0, maxShownProfiles)
                  .map((profile) => (
                    <tr key={profile.id} className="body-16px text-newBlack-1">
                      <td className="pr-4 py-3.5 align-top">
                        {profile.firstName} {profile.lastName}
                      </td>
                      <td className="pr-4 py-3.5 flex flex-col align-top">
                        {profile.roles.map((role) => {
                          const jobTitle = jobTitles?.find(
                            (jt) => jt.id === role.roleId,
                          );
                          return (
                            <span key={role.roleId}>
                              {jobTitle
                                ? t(
                                    `dashboard.careerPortal.jobTitles.${jobTitle.name}`,
                                  )
                                : role.roleId}
                            </span>
                          );
                        })}
                      </td>
                      <td className="pr-4 py-3.5 align-top">
                        {new Date(profile.editedAt).toLocaleDateString(
                          undefined,
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          },
                        )}
                      </td>
                      <td className="pr-4 py-3.5 align-top">
                        <a
                          href={`${profile.cvUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-newBlack-5 hover:text-darkOrange-5"
                        >
                          {t('dashboard.adminPanel.careers.viewCV')}
                        </a>
                      </td>
                      <td className="py-3.5 align-top">{profile.email}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-fit">
              {sortedCareerProfiles
                .slice(0, maxShownProfiles)
                .map((profile) => (
                  <article
                    key={profile.id}
                    className="p-2 w-full max-sm:max-w-[320px] flex flex-col gap-2 border border-newGray-5 bg-newGray-6 shadow-course-navigation-sm rounded-[10px] md:hidden"
                  >
                    <span className="text-newBlack-1 mobile-subtitle1">
                      {profile.firstName} {profile.lastName}
                    </span>
                    <section className="flex flex-wrap gap-1 body-14px">
                      {profile.roles.map((role, index) => {
                        const jobTitle = jobTitles?.find(
                          (jt) => jt.id === role.roleId,
                        );
                        return (
                          <>
                            <span key={role.roleId} className="text-newBlack-3">
                              {jobTitle
                                ? t(
                                    `dashboard.careerPortal.jobTitles.${jobTitle.name}`,
                                  )
                                : role.roleId}
                            </span>
                            {index !== profile.roles.length - 1 && (
                              <span className="text-newGray-3">·</span>
                            )}
                          </>
                        );
                      })}
                    </section>
                    <div className="flex w-full justify-between items-center mt-auto">
                      <a
                        href={`${profile.cvUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit"
                      >
                        <Button
                          variant="ghost"
                          size="s"
                          className="w-fit !text-newBlack-5 !font-normal underline"
                        >
                          {t('dashboard.adminPanel.careers.viewCV')}
                        </Button>
                      </a>
                      <span className="text-newBlack-5 body-14px">
                        {new Date(profile.editedAt).toLocaleDateString(
                          undefined,
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          },
                        )}
                      </span>
                    </div>
                  </article>
                ))}
            </div>

            {maxShownProfiles < sortedCareerProfiles.length && (
              <div className="w-full max-w-[1012px] flex flex-col gap-[15px] items-center justify-center mt-6 md:mt-12">
                <Button
                  variant="outline"
                  size="m"
                  className="w-[192px]"
                  onClick={() => {
                    setMaxShownProfiles((prev) => prev + 10);
                  }}
                >
                  {t('dashboard.adminPanel.careers.seeMore')}
                </Button>
                <span className="subtitle-medium-16px text-newGray-3 text-center">{`(${t('dashboard.adminPanel.careers.resultsRemaining', { results: sortedCareerProfiles.length - maxShownProfiles })})`}</span>
              </div>
            )}
          </>
        )}
    </>
  );
}
