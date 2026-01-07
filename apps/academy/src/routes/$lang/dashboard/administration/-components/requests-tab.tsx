import { AssignmentStatus } from '@blms/constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchBar } from '#src/components/ui/search-bar.tsx';
import { SubTabsSwitch } from '#src/components/ui/sub-tabs-switch.tsx';
import { trpcClient } from '#src/utils/trpc.js';
import { TranslationRequestsTable } from './translation-requests-table.tsx';

export const RequestsTab = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectedRequests, setShowRejectedRequests] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Fetch number of pending requests
  const fetchPendingCount = async () => {
    try {
      const data =
        await trpcClient.user.translation.getTranslationAssignmentRequests.query(
          {
            status: AssignmentStatus.Requested,
          },
        );
      setPendingCount(data?.length ?? 0);
    } catch (err) {
      console.error('[RequestsTab] Failed fetching pending count', err);
      setPendingCount(0);
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, []);

  return (
    <div className="space-y-6">
      {/* Section Header with Badge */}
      <div className="flex items-center gap-3">
        <h2 className="title-large-sb-24px text-dashboardSectionTitle">
          {t(
            'dashboard.adminPanel.translationPanel.pendingTranslationRequests',
          )}
        </h2>
        {pendingCount > 0 && (
          <span className="inline-flex items-center justify-center bg-brown-800 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full min-w-[1rem] h-5">
            {pendingCount}
          </span>
        )}
      </div>

      {/* Sub-tabs switch */}
      <SubTabsSwitch
        tabs={[
          {
            id: 'pending',
            label: t(
              'dashboard.adminPanel.translationPanel.toggle.pendingRequest',
            ),
          },
          {
            id: 'rejected',
            label: t(
              'dashboard.adminPanel.translationPanel.toggle.rejectedRequests',
            ),
          },
        ]}
        activeTab={showRejectedRequests ? 'rejected' : 'pending'}
        onChange={(id) => setShowRejectedRequests(id === 'rejected')}
      />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t(
          'dashboard.adminPanel.translationPanel.searchPlaceholder',
        )}
        className="max-w-lg"
      />

      {/* Requests Table */}
      <TranslationRequestsTable
        status={showRejectedRequests ? 'rejected' : 'requested'}
        searchQuery={searchQuery}
        onPendingCountChange={setPendingCount}
      />
    </div>
  );
};
