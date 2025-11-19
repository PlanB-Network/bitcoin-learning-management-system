import { Button, Loader } from '@blms/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import LeftArrowIcon from '#src/assets/translation/left_arrow.svg';
import { useTranslationPanelNavigation } from '#src/hooks/use-translation-panel-navigation.ts';
import { useTranslationUserData } from '#src/hooks/use-translation-user-data.ts';
import { TranslationPanelHeader } from '../-components/translation-panel-header.tsx';
import { UserAssignmentsTable } from '../-components/user-assignments-table.tsx';
import { UserInformationCard } from '../-components/user-information-card.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/translation-panel/user/$userId',
)({
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { t } = useTranslation();
  const { userId } = Route.useParams();
  const { navigateToMain, navigateToCourse } = useTranslationPanelNavigation();
  const { userDetails, loading, error, getLanguageName } =
    useTranslationUserData(userId);

  const handleBackToUserManagement = () => {
    navigateToMain('users');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error || !userDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('errors.userNotFound')}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'User details could not be loaded'}
          </p>
          <Button onClick={handleBackToUserManagement}>
            {t(
              'dashboard.adminPanel.translationPanel.userManagement.actions.backToList',
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <TranslationPanelHeader activeTab="users" isUserDetailsPage={true}>
        <div className="mt-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={handleBackToUserManagement}
              className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
            >
              <img src={LeftArrowIcon} alt="Back" className="w-3 h-3" />
              {t(
                'dashboard.adminPanel.translationPanel.userManagement.actions.backToUsers',
              )}
            </button>
          </div>

          {/* Contributor Information Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-6">
            {t(
              'dashboard.adminPanel.translationPanel.userManagement.contributorInformation',
            )}
          </h2>

          {/* Contributor Information Card */}
          <UserInformationCard
            userDetails={userDetails}
            getLanguageName={getLanguageName}
          />

          {/* Assignments History Table */}
          <div className="bg-white p-6">
            <h2 className="title-large-sb-24px text-dashboardSectionTitle mb-4">
              {t(
                'dashboard.adminPanel.translationPanel.userManagement.modal.assignments',
              )}
            </h2>

            <UserAssignmentsTable
              userDetails={userDetails}
              getLanguageName={getLanguageName}
              onCourseClick={navigateToCourse}
            />
          </div>
        </div>
      </TranslationPanelHeader>
    </div>
  );
}
