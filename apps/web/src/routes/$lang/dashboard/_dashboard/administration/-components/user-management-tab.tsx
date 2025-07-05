import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Loader, TableBody, TableCell, TableRow } from '@blms/ui';

import type { AdminUserManagement } from '@blms/types';
import FilterIcon from '#src/assets/icons/Filter.svg';
import { trpcClient } from '#src/utils/trpc.js';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../../-components/shared-table-header.tsx';
import { ContributorAssignmentModal } from '../translation-panel/-components/contributor-assignment-modal.tsx';

export const UserManagementTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUserManagement[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [languages, setLanguages] = useState<
    Array<{ code: string; name: string }>
  >([]);

  /* ------------------------------------------------------------------ */
  /* Fetch helpers                                                      */
  /* ------------------------------------------------------------------ */
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const data =
        await trpcClient.user.translation.getAdminUserManagement.query();
      setUsers(data || []);
    } catch (err) {
      console.error('[UserManagementTab] Failed to fetch users', err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const data =
        await trpcClient.user.translation.getAvailableLanguages.query();
      setLanguages(data || []);
    } catch (err) {
      console.error('[UserManagementTab] Failed to fetch languages', err);
      setLanguages([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLanguages();
  }, []);

  const getLanguageName = (code: string) =>
    languages.find((l) => l.code === code)?.name || code;

  /* ------------------------------------------------------------------ */
  /* Filters                                                            */
  /* ------------------------------------------------------------------ */
  const filteredUsers = useMemo(() => {
    if (!users || !searchQuery.trim()) return users;

    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const langNames = (u.languages || [])
        .map((lc) => getLanguageName(lc).toLowerCase())
        .join(' ');

      return (
        u.username?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        (u.languages || []).some((lc) => lc.toLowerCase().includes(q)) ||
        langNames.includes(q)
      );
    });
  }, [users, searchQuery, languages]);

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  const formatLanguages = (codes: string[]) =>
    codes.length === 0
      ? t('words.none')
      : codes.map(getLanguageName).join(', ');

  const handleViewDetails = (uid: string) => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel/user/$userId',
      params: { userId: uid },
    });
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  if (usersLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="title-large-sb-24px text-dashboardSectionTitle">
            {t('dashboard.adminPanel.translationPanel.userManagement.title')}
          </h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
          >
            <span>
              {t(
                'dashboard.adminPanel.translationPanel.userManagement.addContributor',
              )}
            </span>
            <span className="text-lg">+</span>
          </Button>
        </div>

        <p className="text-gray-600">
          {t(
            'dashboard.adminPanel.translationPanel.userManagement.description',
          )}
        </p>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              'dashboard.adminPanel.translationPanel.searchPlaceholder',
            )}
            className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-newOrange-1 focus:border-newOrange-1 outline-none"
          />
          <img
            src={FilterIcon}
            alt={t('words.filter')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
          />
        </div>
      </div>

      {/* Table */}
      <SharedTable>
        <SharedTableHeader>
          <SharedTableHead className="w-32">
            {t(
              'dashboard.adminPanel.translationPanel.userManagement.table.startDate',
            )}
          </SharedTableHead>
          <SharedTableHead className="w-48">
            {t(
              'dashboard.adminPanel.translationPanel.userManagement.table.username',
            )}
          </SharedTableHead>
          <SharedTableHead className="w-28 text-center">
            {t(
              'dashboard.adminPanel.translationPanel.userManagement.table.assignedCourses',
            )}
          </SharedTableHead>
          <SharedTableHead className="w-56">
            {t(
              'dashboard.adminPanel.translationPanel.userManagement.table.language',
            )}
          </SharedTableHead>
          <SharedTableHead className="w-36">
            {t(
              'dashboard.adminPanel.translationPanel.userManagement.table.actions',
            )}
          </SharedTableHead>
        </SharedTableHeader>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                {searchQuery.trim()
                  ? t('dashboard.adminPanel.translationPanel.noResultsFound')
                  : t(
                      'dashboard.adminPanel.translationPanel.userManagement.noUsers',
                    )}
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((u) => (
              <TableRow key={u.uid} className="hover:bg-gray-50">
                <TableCell className="py-4">
                  {formatDate(u.createdAt)}
                </TableCell>
                <TableCell className="py-4 font-medium">{u.username}</TableCell>
                <TableCell className="py-4 text-center font-medium text-sm">
                  {u.assignedCourses}
                </TableCell>
                <TableCell className="py-4 text-sm text-gray-700">
                  {formatLanguages(u.languages || [])}
                </TableCell>
                <TableCell className="py-4 text-center">
                  <Button
                    size="s"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => handleViewDetails(u.uid)}
                  >
                    {t(
                      'dashboard.adminPanel.translationPanel.userManagement.actions.viewDetails',
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </SharedTable>

      <ContributorAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
