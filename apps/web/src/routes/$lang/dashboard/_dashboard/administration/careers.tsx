import { UserPermission, UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared';
import type {
  JobTitle,
  JoinedCareerProfile,
  JoinedCourse,
  Language,
} from '@blms/types';
import { Button, cn, Loader, TextTag } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import DOMPurify from 'dompurify';
import { type TFunction, t } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { TbArrowsSort, TbDownload } from 'react-icons/tb';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/careers',
)({
  component: AdminCareers,
});

function AdminCareers() {
  const { courses } = useContext(AppContext);
  const { session } = useContext(AppContext);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      navigate({ to: '/' });
    } else if (
      !canAccess(UserRole.Admin, UserPermission.Career)(session?.user)
    ) {
      navigate({ to: '/dashboard/my-courses' });
    }
  }, [session]);

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

  const downloadCareerProfiles = async (profiles: JoinedCareerProfile[]) => {
    const XLSX = await import('xlsx');

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
        'First Name': profile.firstName,
        'Last Name': profile.lastName,
        Country: profile.country,
        Roles: rolesText,
        Email: profile.email,
        LinkedIn: profile.linkedin || 'N/A',
        GitHub: profile.github || 'N/A',
        Telegram: profile.telegram || 'N/A',
        Languages: languagesText,
        'Bitcoin Community': profile.isBitcoinCommunityParticipant
          ? 'yes'
          : 'no',
        'Bitcoin Projects': profile.isBitcoinProjectParticipant ? 'yes' : 'no',
        'Company Sizes': companySizesText,
        'Full-Time Available': profile.isAvailableFullTime ? 'yes' : 'no',
        'Remote Work Preference': profile.remoteWorkPreference,
        'Expected Salary': profile.expectedSalary,
        'Availability Start': profile.availabilityStart,
        'CV URL': `https://planb.network${profile.cvUrl}`,
        'Created At': profile.createdAt,
        'Edited At': profile.editedAt,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // First Name
      { wch: 12 }, // Last Name
      { wch: 12 }, // Country
      { wch: 30 }, // Roles
      { wch: 20 }, // Email
      { wch: 15 }, // LinkedIn
      { wch: 15 }, // GitHub
      { wch: 15 }, // Telegram
      { wch: 30 }, // Languages
      { wch: 10 }, // Bitcoin Community
      { wch: 10 }, // Bitcoin Projects
      { wch: 25 }, // Company Sizes
      { wch: 10 }, // Full-Time Available
      { wch: 20 }, // Remote Work Preference
      { wch: 15 }, // Expected Salary
      { wch: 15 }, // Availability Start
      { wch: 40 }, // CV URL
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
    <PageLayout layoutSize="wide">
      <div className="flex gap-2.5 md:gap-5 mb-5">
        <h1 className="title-large-24px md:display-small-32px text-dashboardSectionText">
          {t('words.careerPortal')}
        </h1>
        <TextTag
          size={isMobile ? 'small' : 'base'}
          mode="light"
          variant="grey"
          className="uppercase"
        >
          {t('words.admin')}
        </TextTag>
      </div>
      <h2 className="title-medium-sb-18px md:title-large-sb-24px text-dashboardSectionTitle mb-2.5 md:mb-4">
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
                onClick={async () => {
                  await downloadCareerProfiles(careerProfiles || []);
                }}
              >
                {t('dashboard.adminPanel.careers.downloadSpreadsheet')}
                <TbDownload className="ml-2" size={24} />
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
                    {t('dashboard.adminPanel.careers.file')}
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
                      <td className="py-3.5 align-top">
                        <button
                          className="underline text-newBlack-5 hover:text-darkOrange-5"
                          onClick={() =>
                            generateCandidateFilePdf(
                              profile,
                              jobTitles || [],
                              languages || [],
                              t,
                              courses,
                            )
                          }
                          type="button"
                        >
                          {t('dashboard.adminPanel.careers.candidateFile')}
                        </button>
                      </td>
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
                    <div className="flex w-full justify-between items-center mt-auto gap-4">
                      <a
                        href={`${profile.cvUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit"
                      >
                        <Button
                          variant="ghost"
                          size="s"
                          className="w-fit !text-newBlack-5 !font-normal underline px-0"
                        >
                          {t('dashboard.adminPanel.careers.viewCV')}
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="s"
                        className="w-fit !text-newBlack-5 !font-normal underline !px-0"
                        onClick={() =>
                          generateCandidateFilePdf(
                            profile,
                            jobTitles || [],
                            languages || [],
                            t,
                            courses,
                          )
                        }
                      >
                        {t('dashboard.adminPanel.careers.candidateFile')}
                      </Button>
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
              <div className="w-full max-w-[1012px] flex flex-col gap-4 items-center justify-center mt-6 md:mt-12">
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
    </PageLayout>
  );
}

const generateCandidateFilePdf = async (
  profile: JoinedCareerProfile,
  jobTitles: JobTitle[],
  languages: Language[],
  t: TFunction<'translation', undefined>,
  courses: JoinedCourse[] | null,
) => {
  const sanitizedProfile = {
    firstName: DOMPurify.sanitize(profile.firstName || ''),
    lastName: DOMPurify.sanitize(profile.lastName || ''),
    country: DOMPurify.sanitize(profile.country || ''),
    email: DOMPurify.sanitize(profile.email || ''),
    linkedin: DOMPurify.sanitize(profile.linkedin || ''),
    github: DOMPurify.sanitize(profile.github || ''),
    telegram: DOMPurify.sanitize(profile.telegram || ''),
    otherContact: DOMPurify.sanitize(profile.otherContact || ''),
    bitcoinCommunityText: DOMPurify.sanitize(
      profile.bitcoinCommunityText || '',
    ),
    bitcoinProjectText: DOMPurify.sanitize(profile.bitcoinProjectText || ''),
    availabilityStart: DOMPurify.sanitize(profile.availabilityStart || ''),
    expectedSalary: DOMPurify.sanitize(profile.expectedSalary || ''),
    cvUrl: DOMPurify.sanitize(profile.cvUrl || ''),
    motivationLetter: DOMPurify.sanitize(profile.motivationLetter || ''),
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${sanitizedProfile.firstName} ${sanitizedProfile.lastName} - Career Profile</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600&family=Noto+Sans+CJK+SC:wght@400;600&family=Noto+Sans+Arabic:wght@400;600&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Noto Sans', 'Noto Sans CJK SC', 'Noto Sans Arabic', Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: white;
          padding: 10mm;
          width: fit-content;
          max-width: 780px;
        }

        @media (max-width: 780px) {
          body {
            padding: 5mm;
            padding-top: 10mm;
          }
        }

        .header {
          margin-bottom: 10px;
        }

        .header h1 {
          font-size: 24px;
          font-weight: 600;
          color: #ff5c00;
        }

        .section {
          margin-bottom: 10px;
          break-inside: avoid;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #ff5c00;
          margin-bottom: 8px;
          padding-bottom: 4px;
        }

        .field {
          margin-bottom: 12px;
          break-inside: avoid;
        }

        .field-label {
          font-weight: 600;
          color: #555;
          margin-bottom: 4px;
          display: block;
        }

        .field-value {
          color: #333;
          white-space: pre-line;
          word-wrap: break-word;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4px;
          margin-bottom: 10px;
        }

        .course-item {
          margin-bottom: 8px;
          padding: 8px;
          background: #f8f9fa;
          border-left: 3px solid #ff5c00;
        }

        .course-name {
          font-weight: 600;
        }

        .course-details {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        @media print {
          body { margin: 0; padding: 15mm; }
          .section { page-break-inside: avoid; }
        }

        @page {
          size: A4;
          margin: 15mm;
        }

        .no-print {
          display: none;
        }

        @media screen {
          .no-print {
            display: block;
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
          }

          .print-button {
            background: #ff5c00;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 10px;
            width: fit-content;
          }

          .print-button:hover {
            background: #ff792e;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="print-button" id="print-btn">Download</button>
        <button class="print-button" id="close-btn">X</button>
      </div>

      <div class="header">
        <h1>${sanitizedProfile.firstName || ''} ${sanitizedProfile.lastName || ''}</h1>
      </div>

      <div class="section">
        ${
          sanitizedProfile.country
            ? `
          <div class="field">
            <span class="field-label">Country:</span>
            <span class="field-value">${sanitizedProfile.country}</span>
          </div>
        `
            : ''
        }

        ${
          sanitizedProfile.email
            ? `
          <div class="field">
            <span class="field-label">Email:</span>
            <span class="field-value">${sanitizedProfile.email}</span>
          </div>
        `
            : ''
        }

        ${
          sanitizedProfile.linkedin
            ? `
          <div class="field">
            <span class="field-label">LinkedIn:</span>
            <span class="field-value">${sanitizedProfile.linkedin}</span>
          </div>
        `
            : ''
        }

        ${
          sanitizedProfile.github
            ? `
          <div class="field">
            <span class="field-label">GitHub:</span>
            <span class="field-value">${sanitizedProfile.github}</span>
          </div>
        `
            : ''
        }

        ${
          sanitizedProfile.telegram
            ? `
          <div class="field">
            <span class="field-label">Telegram:</span>
            <span class="field-value">${sanitizedProfile.telegram}</span>
          </div>
        `
            : ''
        }

        ${
          sanitizedProfile.otherContact
            ? `
          <div class="field">
            <span class="field-label">Other contact:</span>
            <span class="field-value">${sanitizedProfile.otherContact}</span>
          </div>
        `
            : ''
        }
      </div>

      ${
        profile.languages && profile.languages.length > 0
          ? `
        <div class="section">
          <div class="section-title">Languages</div>
          <div class="languages-list">
            ${profile.languages
              .map((lang) => {
                const language = languages?.find(
                  (l) => l.code === lang.languageCode,
                );
                return `<div class="field-value">• ${language?.name || lang.languageCode}: ${t(`dashboard.careerPortal.languageLevels.${lang.level}`)}</div>`;
              })
              .join('')}
              </div>
            </div>
            `
          : ''
      }

            ${
              sanitizedProfile.bitcoinCommunityText ||
              sanitizedProfile.bitcoinProjectText
                ? `
            <div class="section">
            <div class="section-title">Bitcoin related experience</div>
              ${
                sanitizedProfile.bitcoinCommunityText
                  ? `
              <div class="field">
                <span class="field-label">Community involvement:</span>
                <span class="field-value">${sanitizedProfile.bitcoinCommunityText}</span>
              </div>
              `
                  : ''
              }
              ${
                sanitizedProfile.bitcoinProjectText
                  ? `
              <div class="field">
                <span class="field-label">Project involvement:</span>
                <span class="field-value">${sanitizedProfile.bitcoinProjectText}</span>
              </div>
              `
                  : ''
              }
            </div>
            `
                : ''
            }

            ${
              profile.roles && profile.roles.length > 0
                ? `
            <div class="section">
              <div class="section-title">Job search</div>
              <div class="roles-list">
              ${profile.roles
                .map((role) => {
                  const jobTitle = jobTitles?.find(
                    (jt) => jt.id === role.roleId,
                  );
                  return `<div class="field-value">• ${jobTitle ? t(`dashboard.careerPortal.jobTitles.${jobTitle.name}`) : role.roleId}: ${t(`dashboard.careerPortal.roleLevels.${role.level}`)}</div>`;
                })
                .join('')}
          </div>
        </div>
      `
                : ''
            }

      ${
        profile.companySizes && profile.companySizes.length > 0
          ? `
        <div class="section">
          <div class="field">
            <span class="field-label">Preferred company sizes:</span>
            <span class="field-value">${profile.companySizes.map((size) => t(`dashboard.careerPortal.companySizes.${size}`)).join(', ')}</span>
          </div>
        </div>
      `
          : ''
      }

      <div class="section">
        <div class="field">
          <span class="field-label">Availability:</span>
          <span class="field-value">${profile.isAvailableFullTime ? 'Full-time' : 'Part-time'}</span>
        </div>

        ${
          sanitizedProfile.availabilityStart
            ? `
          <div class="field">
            <span class="field-label">Available from:</span>
            <span class="field-value">${sanitizedProfile.availabilityStart}</span>
          </div>
        `
            : ''
        }

        ${
          profile.remoteWorkPreference
            ? `
          <div class="field">
            <span class="field-label">Remote work preference:</span>
            <span class="field-value">${t(`dashboard.careerPortal.remoteWorkPreferences.${profile.remoteWorkPreference}`)}</span>
          </div>
        `
            : ''
        }

        ${
          sanitizedProfile.expectedSalary
            ? `
          <div class="field">
            <span class="field-label">Expected salary:</span>
            <span class="field-value">${sanitizedProfile.expectedSalary}</span>
          </div>
        `
            : ''
        }
      </div>

      ${
        sanitizedProfile.cvUrl
          ? `
        <div class="section">
        <div class="section-title">CV</div>
          <div class="field">
            <span class="field-label">Link to CV:</span>
            <a href="${window.location.origin}${sanitizedProfile.cvUrl}" target="_blank" noopener noreferrer class="field-value">${window.location.origin}${sanitizedProfile.cvUrl}</a>
          </div>
        </div>
      `
          : ''
      }

      ${
        sanitizedProfile.motivationLetter
          ? `
        <div class="section">
          <div class="field">
            <span class="field-label">Motivation letter:</span>
            <span class="field-value">${sanitizedProfile.motivationLetter}</span>
          </div>
        </div>
      `
          : ''
      }

      ${
        courses && profile.courses && profile.courses.length > 0
          ? `
        <div class="section">
          <div class="section-title">Completed courses</div>
          <div class="courses-list">
            ${profile.courses
              .map((course) => {
                const courseDetails = courses.find(
                  (c) => c.id === course.courseId,
                );
                return { ...course, courseDetails };
              })
              .filter(
                (course) =>
                  course.courseDetails &&
                  (course.progressPercentage === 100 ||
                    course.courseDetails.teachingFormat === 'professor_led'),
              )
              .sort((a, b) => {
                if (a.courseDetails && b.courseDetails) {
                  const aIndex =
                    Number.parseInt(
                      a.courseDetails.index.replace(/\D/g, ''),
                      10,
                    ) || 0;
                  const bIndex =
                    Number.parseInt(
                      b.courseDetails.index.replace(/\D/g, ''),
                      10,
                    ) || 0;
                  if (aIndex === bIndex) {
                    return (a.courseDetails.index || '').localeCompare(
                      b.courseDetails.index || '',
                    );
                  }
                  return aIndex - bIndex;
                }
                return 0;
              })
              .map(
                (course) => `
                <div class="course-item">
                  <div class="course-name">${course.courseDetails?.name} (${course.courseDetails?.index?.toUpperCase()})</div>
                  ${
                    course.totalScore !== undefined &&
                    course.courseDetails?.teachingFormat === 'professor_led'
                      ? `<div class="course-details">Grade: ${course.totalScore}/100</div>`
                      : ''
                  }
                  ${
                    course.ranking !== undefined &&
                    course.courseDetails?.teachingFormat === 'professor_led'
                      ? `<div class="course-details">Ranking: ${course.ranking}/${course.totalStudents}</div>`
                      : ''
                  }
                </div>
              `,
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }
    </body>
    </html>
  `;

  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    const printBtn = newWindow.document.getElementById('print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => newWindow.print());
    }
    const closeBtn = newWindow.document.getElementById('close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => newWindow.close());
    }
  }
};
